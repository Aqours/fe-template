import { isCI } from 'ci-info';

!isCI && import('husky').then((module) => module.default());
