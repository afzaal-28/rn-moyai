# rn-moyai

React Native UI components.

## Install
```bash
npm i rn-moyai
```

## Usage
```tsx
import React from 'react';
import { MoyaiProvider, Button, Spinner, Stack, Text } from 'rn-moyai';

export function Example() {
  return (
    <MoyaiProvider>
      <Stack spacing={12} style={{ padding: 16 }}>
        <Text variant="title">rn-moyai</Text>
        <Button loading>Continue</Button>
        <Spinner />
      </Stack>
    </MoyaiProvider>
  );
}
```
