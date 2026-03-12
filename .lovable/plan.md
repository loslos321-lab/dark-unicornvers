

## Fix Build Errors

Three build errors to fix:

### 1. `AgentChat.tsx` (line 28)
`scrollClientHeight` → `scrollHeight` (typo fix)

### 2. `SocialEngineeringDefense.tsx` (line 783)
Missing `ChevronRight` import — add it to the lucide-react import on line 2.

### 3. `useOpenClaw.ts` (line 77)
`Comlink.wrap(worker)` returns `Remote<unknown>`, so `.initialize()` isn't recognized. Fix by typing the wrapped agent: `Comlink.wrap<typeof api>(worker)` where `api` type is defined, or cast to `any` since `agentRef` is already `any`.

**Changes:**
- `src/components/AgentChat.tsx` line 28: `scrollClientHeight` → `scrollHeight`
- `src/components/tools/SocialEngineeringDefense.tsx` line 2: add `ChevronRight` to imports
- `src/hooks/useOpenClaw.ts` line 69: cast `Comlink.wrap(worker)` to `any` to match `agentRef` typing

