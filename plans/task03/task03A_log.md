## Change 1
**File:** src/features/ashburton/index.ts *(new file)*

**Before:**
```
(new file)
```

**After:**
```
  1: export * from './ashburton.component';
  2: export * from './ashburton.service';
  3: export * from './ashburton.types';
```

**Why:** [agent] Creates the Ashburton feature module barrel file to expose its public API (component, service, and types) through a single import path.
**Model:** claude-sonnet-4-5

---
## Change 2
**File:** src/features/ashburton/ashburton.config.ts *(new file)*

**Before:**
```
(new file)
```

**After:**
```
  1: export const ashburtonConfig = {};
```

**Why:** new-file creation rejected by developer
**Model:** claude-sonnet-4-5

---
## Change 3
**File:** src/features/index.ts *(new file)*

**Before:**
```
(new file)
```

**After:**
```
  1: import { FeatureRegistry } from '../core/FeatureRegistry';
  2: import { AshburtonModule } from './ashburton/AshburtonModule';
  3: 
  4: FeatureRegistry.register(AshburtonModule);
```

**Why:** [agent] Registers the AshburtonModule with the application feature registry so it participates in the standard feature lifecycle. The import is added alongside the registration call to keep the change self-contained.
**Model:** claude-sonnet-4-5

---
