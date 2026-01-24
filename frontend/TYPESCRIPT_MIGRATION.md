# TypeScript Migration Guide

## What Changed

The frontend has been successfully migrated from JavaScript to TypeScript, providing better type safety and developer experience.

### File Changes

| Old File | New File | Type |
|----------|----------|------|
| config.js | config.ts | Config |
| services/gameService.js | services/gameService.ts | Service with Types |
| components/MainMenu.js | components/MainMenu.tsx | React Component |
| components/CharacterCreation.js | components/CharacterCreation.tsx | React Component |
| components/GameWorld.js | components/GameWorld.tsx | React Component |
| App.js | App.tsx | React Component |
| index.js | index.tsx | Entry Point |

### New Files Added

- **tsconfig.json** - TypeScript compiler configuration
- **tsconfig.node.json** - TypeScript config for Node tools
- **react-app-env.d.ts** - React type definitions

### Updated Files

- **package.json** - Added TypeScript and @types packages

---

## TypeScript Features Used

### Type Definitions

All API responses have proper TypeScript interfaces:

```typescript
interface GameClass {
  id: string;
  name: string;
  health_point: number;
  physical_attack: number;
  physical_defense: number;
  magical_attack: number;
  magical_defense: number;
  description: string;
}

interface Race {
  id: string;
  name: string;
  physical_bonus: number;
  magical_bonus: number;
  health_bonus: number;
  description: string;
}

interface Hero {
  name: string;
  class: string;
  race: string;
  level: number;
  experience: number;
  stats: HeroStats;
  created_at: string;
}
```

### React Component Types

All components use proper TypeScript types:

```typescript
interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onQuit: () => void;
}

const MainMenu: FC<MainMenuProps> = ({ onNewGame, onLoadGame, onQuit }) => {
  // Component code
};
```

### State Management

The App component uses proper state typing:

```typescript
interface AppState {
  currentPage: PageType;
  classes: GameClass[];
  races: Race[];
  hero: Hero | null;
  loading: boolean;
  error: string | null;
}

const [appState, setAppState] = useState<AppState>({
  // Initial state
});
```

### Union Types

Used for page navigation:

```typescript
type PageType = 'mainMenu' | 'newGame' | 'gameWorld';
type CreationStep = 'name' | 'class' | 'race' | 'review';
```

### Function Return Types

All functions have explicit return types:

```typescript
const handleNewGame = (): void => {
  setAppState((prev) => ({ ...prev, currentPage: 'newGame' }));
};

const fetchGameData = async (): Promise<void> => {
  // Async function with Promise return type
};
```

### Axios Response Types

API calls are fully typed:

```typescript
import axios, { AxiosResponse } from 'axios';

export const gameService = {
  getClasses: (): Promise<AxiosResponse<ClassesResponse>> => 
    axios.get(endpoints.classes),
};
```

---

## Benefits of This Migration

### 1. **Type Safety**
- Catch errors at compile time instead of runtime
- IDE autocomplete for all variables and functions
- Prevents passing wrong types to functions

### 2. **Better Developer Experience**
- IntelliSense shows available properties and methods
- Documentation appears in editor tooltips
- Refactoring is safer with type checking

### 3. **Self-Documenting Code**
- Types serve as documentation
- Clear contracts between components
- Easy to understand what functions expect

### 4. **Maintainability**
- Easier to maintain large codebases
- Refactoring confidence
- Clear API contracts

### 5. **Reduced Bugs**
- Props validation at compile time
- State mutations are type-safe
- API response handling is validated

---

## How to Use

### Development

The development server works exactly the same:

```powershell
npm start
```

TypeScript is compiled automatically by React Scripts.

### Building

```powershell
npm run build
```

TypeScript is compiled to JavaScript for production.

### Type Checking

To check types without running the dev server:

```powershell
npx tsc --noEmit
```

---

## Configuration Details

### tsconfig.json

Key compiler options:

- **target: ES2020** - Target modern JavaScript
- **jsx: react-jsx** - Use React 18+ JSX transform
- **strict: true** - Enable all strict type checking options
- **noUnusedLocals: true** - Error on unused variables
- **noUnusedParameters: true** - Error on unused parameters
- **noFallthroughCasesInSwitch: true** - Error on fallthrough cases

### Path Aliases

The configuration includes path aliases for cleaner imports:

```typescript
// Instead of:
import { gameService } from '../../../../services/gameService';

// You can use:
import { gameService } from '@services/gameService';
```

---

## Common TypeScript Patterns Used

### 1. React Functional Components

```typescript
interface Props {
  title: string;
  onClick: () => void;
}

const MyComponent: FC<Props> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>;
};
```

### 2. useState with Types

```typescript
const [hero, setHero] = useState<Hero | null>(null);
const [count, setCount] = useState<number>(0);
const [items, setItems] = useState<GameClass[]>([]);
```

### 3. useEffect with Async

```typescript
useEffect(() => {
  const fetchData = async (): Promise<void> => {
    const response = await gameService.getClasses();
    setClasses(response.data.classes);
  };

  fetchData();
}, []);
```

### 4. Event Handlers

```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
  // Handle click
};
```

### 5. API Service Pattern

```typescript
export const gameService = {
  getClasses: (): Promise<AxiosResponse<ClassesResponse>> => 
    axios.get(endpoints.classes),
};
```

---

## Type Definitions for API

All API types are defined in `services/gameService.ts`:

### Request Types
- `HeroCreationData`
- `GameClass`
- `Race`

### Response Types
- `ClassesResponse`
- `RacesResponse`
- `HeroCreationResponse`
- `ApiError`

### Domain Types
- `Hero`
- `HeroStats`

---

## Best Practices Implemented

1. **Strict Mode** - All type checking enabled
2. **No Any Types** - All types are explicitly defined
3. **Union Types** - Used for limited options (e.g., PageType)
4. **Optional Properties** - Using `?` for optional fields
5. **Readonly** - Using `as const` for immutable configuration
6. **Generic Types** - Axios response types are properly generic

---

## Troubleshooting

### Type Error: Property does not exist

Make sure the property is defined in the interface and matches the API response.

### Type Error: Cannot assign type X to type Y

Use type assertions carefully:
```typescript
const hero = response.data as Hero;
```

### Missing Type Definitions

If a package doesn't have types, install @types:
```bash
npm install --save-dev @types/package-name
```

---

## Next Steps

### To Continue Using TypeScript

1. Keep using `.tsx` for React components
2. Keep using `.ts` for utilities and services
3. Define interfaces for new API responses
4. Use proper types for all component props

### To Add More Features

Examples with TypeScript:

```typescript
// New component with types
interface Props {
  inventory: Item[];
  onUseItem: (itemId: string) => void;
}

const Inventory: FC<Props> = ({ inventory, onUseItem }) => {
  return (
    // Component JSX
  );
};

// New service function
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export const gameService = {
  getUserProfile: (): Promise<AxiosResponse<ApiResponse<UserProfile>>> =>
    axios.get('/api/user/profile'),
};
```

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Axios TypeScript Support](https://axios-http.com/docs/typescript)
- [TypeScript and React](https://www.typescriptlang.org/docs/handbook/react.html)

---

## Summary

The frontend is now fully TypeScript! ✨

- ✅ All components are `.tsx` with proper typing
- ✅ All services have type-safe API calls
- ✅ All state management is typed
- ✅ Configuration includes path aliases
- ✅ Development workflow unchanged
- ✅ Better IDE support and error checking

The game works exactly the same, but now with the benefits of TypeScript! 🎮
