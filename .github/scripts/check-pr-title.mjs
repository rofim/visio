#!/usr/bin/env node
// Usage: check-pr-title.mjs "<pr title>"
// Exits 1 with the reasons on stderr when the title does not follow the PR conventions.

const TYPES = ['feat', 'fix', 'chore', 'docs', 'refactor', 'perf', 'test', 'build', 'ci', 'revert'];
const PROJECTS = ['rofano', 'rof', 'devops', 'cur', 'dd', 'ds', 'kc', 'ort', 'pe', 'plevents', 'plnotif', 'sana', 'von'];
const RELEASE_PR_PATTERN = /^(MEP|MEPP)\s+\d{2}-\d{2}-\d{4}\s+-\s+V\d+\.\d+\.\d+$/;
const MAX_LENGTH = 100;

const FORMAT_HELP = `Format de titre invalide.

  1. Pour les PR classiques:
  - [type]: rofano-XXX - description
  - [type]: rof-XXX - description
  - [type]: devops-XXX - description
  Projets acceptés : ${PROJECTS.join(', ')}
  Liste des types possibles :
${TYPES.map((type) => `  - ${type}`).join('\n')}
  2. Pour les PR de release:
  - MEP DD-MM-YYYY - version_number
  - MEPP DD-MM-YYYY - version_number

  Note:
  - Le titre doit être en minuscules
  - Maximum ${MAX_LENGTH} caractères`;

// "[type]: project-123 - description", checked piece by piece to keep each pattern trivial.
function isNormalTitle(title) {
    const parts = /^\[(\w+)\]:\s+(\S+)\s+-\s+(\S.*)$/.exec(title);
    if (!parts) {
        return false;
    }
    const [, type, ticket] = parts;
    const [project, number, ...rest] = ticket.split('-');
    return TYPES.includes(type) && PROJECTS.includes(project) && /^\d+$/.test(number ?? '') && rest.length === 0;
}

export function checkPrTitle(title) {
    if (isNormalTitle(title)) {
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
