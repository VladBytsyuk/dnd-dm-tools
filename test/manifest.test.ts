import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function readJSON(p: string) {
  return JSON.parse(fs.readFileSync(path.resolve(p), 'utf-8'));
}

describe('manifest.json', () => {
  it('содержит обязательные поля', () => {
    const manifest = readJSON('manifest.json');
    expect(manifest).toHaveProperty('id');
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('version');
    expect(manifest).toHaveProperty('minAppVersion');
  });

  it('версии согласованы с versions.json', () => {
    const manifest = readJSON('manifest.json');
    const versions = readJSON('versions.json');
    expect(versions).toHaveProperty(manifest.version);
  });
});
