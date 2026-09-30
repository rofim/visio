#!/usr/bin/env node
// Usage: check-pr-title.mjs "<pr title>"
// Exits 1 with the reasons on stderr when the title does not follow the PR conventions.

const NORMAL_PR_PATTERN =
    /^\[(feat|fix|chore|docs|refactor|perf|test|build|ci|revert)\]:\s+((?:rofano|rof|devops|cur|dd|ds|kc|ort|pe|plevents|plnotif|sana|von)-\d+)\s+-\s+.+$/;
const RELEASE_PR_PATTERN = /^(MEP|MEPP)\s+\d{2}-\d{2}-\d{4}\s+-\s+V\d+\.\d+\.\d+$/;
const MAX_LENGTH = 100;

const FORMAT_HELP = `Format de titre invalide.

  1. Pour les PR classiques:
  - [type]: rofano-XXX - description
  - [type]: rof-XXX - description
  - [type]: devops-XXX - description
  Projets acceptés : rofano, rof, devops, cur, dd, ds, kc, ort, pe, plevents, plnotif, sana, von
  Liste des types possibles :
  - feat
  - fix
  - chore
  - docs
  - refactor
  - perf
  - test
  - build
  - ci
  - revert
  2. Pour les PR de release:
  - MEP DD-MM-YYYY - version_number
  - MEPP DD-MM-YYYY - version_number

  Note:
  - Le titre doit être en minuscules
  - Maximum ${MAX_LENGTH} caractères`;

export function checkPrTitle(title) {
    if (NORMAL_PR_PATTERN.test(title)) {
        const errors = [];
        if (title.length > MAX_LENGTH) {
            errors.push(`Le titre ne doit pas dépasser ${MAX_LENGTH} caractères. Longueur actuelle : ${title.length}`);
        }
        if (title !== title.toLowerCase()) {
            errors.push('Le titre doit être entièrement en minuscules.');
        }
        return errors;
    }
    return RELEASE_PR_PATTERN.test(title) ? [] : [FORMAT_HELP];
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    const errors = checkPrTitle(process.argv[2] ?? '');
    for (const error of errors) {
        console.error(error);
    }
    process.exit(errors.length ? 1 : 0);
}
