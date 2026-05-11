import fs from 'node:fs';
import path from 'node:path';

function readJson(root, relativePath, failures) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    failures.push(`${relativePath} missing`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function descriptive(value) {
  return typeof value === 'string' && value.trim().length >= 12;
}

export function validateEvalSuite(root) {
  const failures = [];
  const evals = readJson(root, 'evals/evals.json', failures);
  const schema = readJson(root, 'evals/evals.schema.json', failures);
  const index = readJson(root, 'assets/templates/INDEX.json', failures);
  if (!evals || !schema || !index) return failures;

  if (evals.$schema !== './evals.schema.json') failures.push('evals/evals.json must reference ./evals.schema.json');
  if (evals.version !== '1.0') failures.push(`evals.version must be 1.0, got ${evals.version}`);
  if (!Array.isArray(evals.quality_principles) || evals.quality_principles.length < 4) {
    failures.push('evals.quality_principles must contain at least 4 items');
  }
  if (!Array.isArray(evals.scenarios) || evals.scenarios.length < 12) {
    failures.push('evals.scenarios must contain at least 12 scenarios');
    return failures;
  }

  const routes = new Map((index.modeRoutes || []).map((route) => [route.mode, route]));
  const expectedModes = ['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-08', 'A-09', 'A-10', 'A-11', 'A-12'];
  const ids = new Set();
  const coveredModes = new Set();
  let firstRun = false;

  for (const scenario of evals.scenarios) {
    const id = scenario.id || '<missing-id>';
    if (!/^[a-z0-9][a-z0-9-]{2,90}$/.test(id)) failures.push(`${id}: id must be stable kebab-case`);
    if (ids.has(id)) failures.push(`${id}: duplicate scenario id`);
    ids.add(id);

    const route = routes.get(scenario.mode);
    if (!route) failures.push(`${id}: unknown mode ${scenario.mode}`);
    else {
      coveredModes.add(scenario.mode);
      if (scenario.templateId !== route.templateId) failures.push(`${id}: templateId ${scenario.templateId} does not match INDEX route ${route.templateId}`);
    }

    for (const key of ['prompt_zh', 'prompt_en', 'user_value', 'agent_value']) {
      if (!descriptive(scenario[key])) failures.push(`${id}: ${key} must be descriptive`);
    }

    const contract = scenario.agent_contract || {};
    if (contract.route !== scenario.mode) failures.push(`${id}: agent_contract.route must equal ${scenario.mode}`);
    if (!Array.isArray(contract.must_read) || contract.must_read.length < 3) failures.push(`${id}: agent_contract.must_read must include at least 3 files`);
    else {
      for (const rel of contract.must_read) {
        if (typeof rel !== 'string' || rel.startsWith('/') || rel.includes('..')) failures.push(`${id}: unsafe must_read path ${rel}`);
        else if (!fs.existsSync(path.join(root, rel))) failures.push(`${id}: missing must_read file ${rel}`);
      }
      if (!contract.must_read.includes('assets/templates/INDEX.json')) failures.push(`${id}: must_read must include assets/templates/INDEX.json`);
    }
    if (!Array.isArray(contract.verification) || contract.verification.length < 1) failures.push(`${id}: agent_contract.verification required`);
    else if (!contract.verification.some((command) => String(command).startsWith('npm run verify:lite -- '))) failures.push(`${id}: verification must include verify:lite`);
    if (typeof contract.tier !== 'string' || !contract.tier.includes('Tier 0')) failures.push(`${id}: tier must name Tier 0 boundary`);

    if (id.includes('first-run')) {
      firstRun = true;
      const evidence = new Set(contract.first_run_evidence || []);
      for (const item of ['output file path', 'mode route used', 'template id used', 'assumptions made', 'verification command or check performed', 'known caveats that affect use']) {
        if (!evidence.has(item)) failures.push(`${id}: first_run_evidence missing ${item}`);
      }
    }
  }

  for (const mode of expectedModes) {
    if (!coveredModes.has(mode)) failures.push(`eval suite missing coverage for ${mode}`);
  }
  if (!firstRun) failures.push('eval suite must include a first-run scenario');

  return failures;
}
