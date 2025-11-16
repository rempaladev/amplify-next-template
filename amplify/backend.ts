import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
});

// Grant Secrets Manager access to the SSR function
const secretsPolicy = new PolicyStatement({
  actions: ['secretsmanager:GetSecretValue'],
  resources: ['arn:aws:secretsmanager:*:*:secret:elevenlabs-*'],
});

backend.addOutput({
  custom: {
    secretsPolicy: secretsPolicy.sid,
  },
});
