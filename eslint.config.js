import { defineConfig } from 'eslint/config'
import * as config from '@lvce-editor/eslint-config'

export default defineConfig([
  ...config.default,
  ...config.recommendedActions,
  {
    // The pinned application supplies its own Node runtime.
    files: ['.github/workflows/integration.yml'],
    rules: {
      'github-actions/node-version-file': 'off',
      'github-actions/on': 'off',
    },
  },
  {
    // Preserve real DOM input events covered by the migrated application scenarios.
    files: [
      'packages/e2e-integration/src/viewlet.editor-html-empty-style-rendered.ts',
    ],
    rules: { '@typescript-eslint/no-deprecated': 'off' },
  },
  {
    // The application runner supplies mutable API objects to these scenarios.
    files: ['packages/e2e-integration/src/**/*.ts'],
    rules: { '@typescript-eslint/prefer-readonly-parameter-types': 'off' },
  },
])
