#!/usr/bin/env bash
# Usage: start-aws-pipelines.sh <environment> <commit_id> <app>[@<region>]...
# Each app is deployed by the pipeline rofim-<environment>-<app>, in eu-west-1 unless a region is given.
# Pipelines are started one at a time, 6 s apart, because CodePipeline throttles starts after a burst of ~20.
set -uo pipefail

environment=$1
commit_id=$2
shift 2
declare -A regions execution_ids statuses started_at durations reasons
apps=()

for target in "$@"; do
  app=${target%@*}
  apps+=("$app")
  regions[$app]=eu-west-1
  [[ $target == *@* ]] && regions[$app]=${target#*@}
done

for app in "${apps[@]}"; do
  statuses[$app]=NotStarted
  for attempt in 1 2 3 4 5; do
    execution_id=$(aws codepipeline start-pipeline-execution \
      --region "${regions[$app]}" \
      --name "rofim-$environment-$app" \
      --source-revisions "actionName=Source,revisionType=COMMIT_ID,revisionValue=$commit_id" \
      --query pipelineExecutionId --output text) && break
    execution_id=""
    sleep $((attempt * 5))
  done
  if [[ -n "$execution_id" ]]; then
    echo "Started rofim-$environment-$app: $execution_id"
    execution_ids[$app]=$execution_id
    statuses[$app]=InProgress
    started_at[$app]=$SECONDS
  fi
  sleep 6
done

deadline=$((SECONDS + 1200))
while [[ $SECONDS -lt $deadline ]]; do
  running=0
  for app in "${apps[@]}"; do
    [[ ${statuses[$app]} == InProgress || ${statuses[$app]} == Stopping ]] || continue
    status=$(aws codepipeline get-pipeline-execution \
      --region "${regions[$app]}" \
      --pipeline-name "rofim-$environment-$app" \
      --pipeline-execution-id "${execution_ids[$app]}" \
      --query pipelineExecution.status --output text) || status=${statuses[$app]}
    statuses[$app]=$status
    if [[ $status == InProgress || $status == Stopping ]]; then
      running=$((running + 1))
    else
      durations[$app]="$(((SECONDS - started_at[$app]) / 60))m$(((SECONDS - started_at[$app]) % 60))s"
      echo "$app: $status after ${durations[$app]}"
    fi
  done
  [[ $running -eq 0 ]] && break
  echo "$running pipeline(s) still running"
  sleep 20
done

failed=0
for app in "${apps[@]}"; do
  case ${statuses[$app]} in
    Succeeded) continue ;;
    Superseded)
      echo "::warning title=$app Superseded::A newer execution of rofim-$environment-$app replaced this one"
      continue
      ;;
    NotStarted) reasons[$app]="Pipeline could not be started" ;;
    InProgress | Stopping) reasons[$app]="Still running after 20 min" ;;
    *) reasons[$app]=$(aws codepipeline list-action-executions \
      --region "${regions[$app]}" \
      --pipeline-name "rofim-$environment-$app" \
      --filter "pipelineExecutionId=${execution_ids[$app]}" \
      --query "actionExecutionDetails[?status=='Failed'] | [0].[actionName, output.executionResult.errorDetails.message || output.executionResult.externalExecutionSummary]" \
      --output text | grep -vx None | sed 's/\tNone$//; s/\t/: /' | tr '\n|' '  ' | sed 's/ *$//') ;;
  esac
  failed=$((failed + 1))
  echo "::error title=$app ${statuses[$app]}::${reasons[$app]:-No failed action reported by CodePipeline}" >&2
done

{
  echo "| App | Status | Duration | Failure |"
  echo "|---|---|---|---|"
  for app in "${apps[@]}"; do
    case ${statuses[$app]} in
      Succeeded) icon=✅ ;;
      Superseded) icon=⚠️ ;;
      *) icon=❌ ;;
    esac
    echo "| $app | $icon ${statuses[$app]} | ${durations[$app]:-} | ${reasons[$app]:-} |"
  done
} >> "$GITHUB_STEP_SUMMARY"

exit $((failed > 0))
