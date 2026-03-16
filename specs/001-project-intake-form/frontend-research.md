# Frontend Framework Research: Project Intake Form

**Date**: 2026-03-13
**Purpose**: Evaluate frontend approaches for implementing the intake form with dynamic placeholder behavior
**Constitutional Requirement**: Code must prioritize readability and simplicity (Constitution Principle I)

## Requirements Summary

### Functional Requirements
- 8-field intake form (text inputs + textareas)
- Dynamic example text behavior:
  - Show gray example text when field is empty
  - Hide example text immediately when user types
  - Restore example text when field is cleared
- Form submission to backend API
- Admin view displaying list of submissions
- Must be unit testable
- Support modern browsers (Chrome, Firefox, Safari)

### Constitutional Constraints
- **Principle I**: Code readability mandatory (descriptive naming, max 50 lines/function, cyclomatic complexity ≤ 10)
- **Principle II**: Containerized deployment (affects build complexity)
- **Principle III**: Unit testing with 80% coverage (framework must support isolated testing)
- **Principle IV**: Security scanning (dependency vulnerabilities matter)

## Framework Options Evaluated

### Option 1: Vanilla HTML/CSS/JavaScript

#### Implementation Approach
```html
<!-- Example field implementation -->
<div class="form-field">
  <label for="project-name">Project Name</label>
  <input
    type="text"
    id="project-name"
    placeholder="Example: PseudoLavaLamp Diffusion Model Study"
    data-example="Example: PseudoLavaLamp Diffusion Model Study">
</div>
```

```javascript
// Example text behavior
function initializeExampleBehavior() {
  document.querySelectorAll('input, textarea').forEach(field => {
    const example = field.dataset.example;

    field.addEventListener('input', () => {
      if (field.value.length > 0) {
        field.placeholder = '';
      } else {
        field.placeholder = example;
      }
    });
  });
}
```

#### Pros
- **Zero build complexity**: No compilation, bundling, or transpilation required
- **No dependencies**: No npm packages to scan for vulnerabilities
- **Minimal container**: Single nginx container serving static HTML/CSS/JS
- **Direct testing**: Can use native DOM APIs with JSDOM or browser testing
- **Maximum readability**: Direct DOM manipulation, no framework abstractions
- **Tiny bundle size**: ~5-10 KB total JavaScript
- **Instant deployment**: Copy files to web server, done

#### Cons
- **Manual state management**: Need to manually track form state
- **Repetitive code**: Each field requires similar event listeners
- **Limited testing infrastructure**: Need to set up testing framework from scratch
- **No component reusability**: Copy/paste for similar fields
- **Manual API calls**: Need to write fetch logic without abstraction

#### Constitutional Compliance
- **Principle I (Readability)**: ✅ EXCELLENT - Direct, imperative code is self-documenting
- **Principle II (Container)**: ✅ EXCELLENT - Single nginx Alpine container, ~10 MB
- **Principle III (Testing)**: ⚠️ MODERATE - Need to set up Jest/Mocha + JSDOM manually
- **Principle IV (Security)**: ✅ EXCELLENT - Zero dependencies = zero dependency vulnerabilities

#### Complexity Assessment
- **Lines of code estimate**: ~200-300 lines total
- **Build complexity**: None (direct file serving)
- **Testing setup complexity**: Moderate (manual Jest/Mocha configuration)
- **Learning curve**: None (standard web APIs)

---

### Option 2: React

#### Implementation Approach
```javascript
// FormField component
function FormField({ label, name, type = 'text', example, multiline = false }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const FieldComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <FieldComponent
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={value === '' ? example : ''}
      />
    </div>
  );
}
```

#### Pros
- **Component reusability**: FormField component used for all 8 fields
- **Strong testing ecosystem**: Jest + React Testing Library built-in
- **Mature tooling**: Create React App or Vite provide complete build setup
- **Large community**: Abundant documentation and examples
- **State management**: React hooks handle form state cleanly

#### Cons
- **Build complexity**: Webpack/Vite build step required, multi-stage Dockerfile needed
- **Large bundle size**: ~40-50 KB minified (React runtime + ReactDOM)
- **Dependency count**: 10+ direct dependencies, 100+ transitive dependencies
- **Over-engineering**: React designed for complex UIs, this is a simple form
- **Learning curve**: Need to understand JSX, hooks, component lifecycle
- **Slower development**: Configure build tools, deal with toolchain issues

#### Constitutional Compliance
- **Principle I (Readability)**: ✅ GOOD - Component structure is clear, but JSX adds abstraction
- **Principle II (Container)**: ⚠️ MODERATE - Multi-stage build required, ~50 MB build container
- **Principle III (Testing)**: ✅ EXCELLENT - Jest + React Testing Library are industry standard
- **Principle IV (Security)**: ⚠️ MODERATE - Many dependencies to scan, regular vulnerability patches needed

#### Complexity Assessment
- **Lines of code estimate**: ~300-400 lines (components + build config)
- **Build complexity**: High (webpack/vite configuration, babel transpilation)
- **Testing setup complexity**: Low (included in CRA/Vite)
- **Learning curve**: High (JSX, hooks, React patterns)

---

### Option 3: Vue

#### Implementation Approach
```vue
<!-- FormField.vue -->
<template>
  <div class="form-field">
    <label :for="name">{{ label }}</label>
    <textarea
      v-if="multiline"
      :id="name"
      :name="name"
      v-model="value"
      :placeholder="value === '' ? example : ''"
    />
    <input
      v-else
      :id="name"
      :name="name"
      :type="type"
      v-model="value"
      :placeholder="value === '' ? example : ''"
    />
  </div>
</template>

<script>
export default {
  props: ['label', 'name', 'type', 'example', 'multiline'],
  data() {
    return { value: '' };
  }
};
</script>
```

#### Pros
- **Simpler than React**: More intuitive template syntax, less boilerplate
- **Smaller bundle**: ~30-35 KB minified (Vue runtime)
- **Good testing support**: Vue Test Utils + Jest work well
- **Component reusability**: Single FormField component for all fields
- **Gentle learning curve**: Template syntax similar to HTML
- **Form handling**: v-model directive simplifies two-way binding

#### Cons
- **Build complexity**: Still requires Vite/webpack build step
- **Moderate dependencies**: Fewer than React, but still 50+ transitive deps
- **Less widespread**: Smaller ecosystem than React (but sufficient for this use case)
- **Still over-engineered**: Vue designed for complex SPAs, not simple forms

#### Constitutional Compliance
- **Principle I (Readability)**: ✅ EXCELLENT - Template syntax is very readable
- **Principle II (Container)**: ⚠️ MODERATE - Multi-stage build required, ~40 MB build container
- **Principle III (Testing)**: ✅ GOOD - Vue Test Utils provide solid testing support
- **Principle IV (Security)**: ⚠️ MODERATE - Moderate dependency count requires regular scanning

#### Complexity Assessment
- **Lines of code estimate**: ~250-350 lines (components + build config)
- **Build complexity**: Moderate (Vite configuration simpler than webpack)
- **Testing setup complexity**: Low (Vite + Vue Test Utils)
- **Learning curve**: Moderate (template syntax, directives, reactive data)

---

### Option 4: Alpine.js

#### Implementation Approach
```html
<!-- Direct HTML with Alpine directives -->
<div x-data="intakeForm()">
  <form @submit.prevent="submitForm">
    <div class="form-field">
      <label for="project-name">Project Name</label>
      <input
        type="text"
        id="project-name"
        x-model="form.projectName"
        :placeholder="form.projectName === '' ? examples.projectName : ''"
      >
    </div>

    <!-- Repeat for 7 more fields -->

    <button type="submit">Submit</button>
  </form>
</div>

<script>
function intakeForm() {
  return {
    form: {
      projectName: '',
      projectOverview: '',
      // ... 6 more fields
    },
    examples: {
      projectName: 'Example: PseudoLavaLamp Diffusion Model Study',
      // ... 7 more examples
    },
    submitForm() {
      fetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(this.form)
      });
    }
  };
}
</script>
```

#### Pros
- **Minimal build**: Can use Alpine from CDN, no build step required
- **Tiny footprint**: ~15 KB gzipped
- **HTML-first**: Markup stays in HTML, feels like enhancing not replacing
- **Reactive data**: Alpine handles placeholder toggling automatically
- **Very low dependencies**: Single dependency if using CDN, or npm package only
- **Easy testing**: Can test with JSDOM or browser environment
- **Fast learning**: Minimal API surface, straightforward directives

#### Cons
- **Limited component abstraction**: Less reusable than Vue/React components
- **Repetitive markup**: Each field needs similar Alpine directives
- **Less tooling**: No dedicated testing library like React Testing Library
- **Smaller ecosystem**: Fewer examples and plugins than major frameworks

#### Constitutional Compliance
- **Principle I (Readability)**: ✅ EXCELLENT - Declarative directives in HTML are very readable
- **Principle II (Container)**: ✅ EXCELLENT - Can use CDN (no build) or minimal npm build
- **Principle III (Testing)**: ⚠️ MODERATE - Need to set up testing infrastructure manually
- **Principle IV (Security)**: ✅ EXCELLENT - Single dependency (or zero if using CDN)

#### Complexity Assessment
- **Lines of code estimate**: ~150-250 lines (mostly HTML)
- **Build complexity**: Minimal (optional npm build or direct CDN)
- **Testing setup complexity**: Moderate (manual Jest setup)
- **Learning curve**: Low (handful of directives to learn)

---

### Option 5: Svelte

#### Implementation Approach
```svelte
<!-- FormField.svelte -->
<script>
  export let label;
  export let name;
  export let example;
  export let multiline = false;

  let value = '';
  $: placeholder = value === '' ? example : '';
</script>

<div class="form-field">
  <label for={name}>{label}</label>
  {#if multiline}
    <textarea id={name} {name} bind:value {placeholder} />
  {:else}
    <input type="text" id={name} {name} bind:value {placeholder} />
  {/if}
</div>
```

#### Pros
- **Compiled away**: No runtime framework, compiles to vanilla JS
- **Smallest bundle**: ~5-10 KB for this use case (only code you use)
- **Excellent performance**: No virtual DOM overhead
- **Readable syntax**: Template syntax similar to HTML, very intuitive
- **Reactive by default**: $ syntax makes reactive updates explicit
- **Good testing**: Svelte Testing Library available

#### Cons
- **Build required**: Svelte is a compiler, must have build step
- **Smaller ecosystem**: Less mature than React/Vue
- **Learning curve**: Svelte-specific patterns and compilation model
- **Moderate dependencies**: Svelte compiler + build tools needed
- **Less widespread**: Fewer developers familiar with Svelte

#### Constitutional Compliance
- **Principle I (Readability)**: ✅ EXCELLENT - Very clean, minimal syntax
- **Principle II (Container)**: ⚠️ MODERATE - Requires build step, multi-stage Dockerfile
- **Principle III (Testing)**: ✅ GOOD - Svelte Testing Library provides good support
- **Principle IV (Security)**: ✅ GOOD - Moderate dependencies, but active maintenance

#### Complexity Assessment
- **Lines of code estimate**: ~200-300 lines (components + build config)
- **Build complexity**: Moderate (Vite/Rollup configuration)
- **Testing setup complexity**: Moderate (Svelte Testing Library + Jest)
- **Learning curve**: Moderate (Svelte-specific patterns)

---

## Comparative Analysis

### Bundle Size Comparison
1. **Vanilla JS**: ~5-10 KB
2. **Alpine.js**: ~15 KB
3. **Svelte**: ~5-10 KB (compiled)
4. **Vue**: ~30-35 KB
5. **React**: ~40-50 KB

### Build Complexity Ranking
1. **Vanilla JS**: None (direct file serving)
2. **Alpine.js**: Minimal (optional build)
3. **Svelte**: Moderate (required compilation)
4. **Vue**: Moderate (Vite build)
5. **React**: High (webpack/Vite + babel)

### Testing Infrastructure Ranking
1. **React**: Excellent (Jest + RTL built-in)
2. **Vue**: Good (Vue Test Utils + Jest)
3. **Svelte**: Good (Svelte Testing Library)
4. **Vanilla JS**: Moderate (manual setup)
5. **Alpine.js**: Moderate (manual setup)

### Code Readability Ranking (for this use case)
1. **Alpine.js**: Declarative HTML-first directives
2. **Vanilla JS**: Direct, imperative DOM manipulation
3. **Svelte**: Clean template syntax, compiled
4. **Vue**: Template syntax, straightforward
5. **React**: JSX abstraction, hooks complexity

### Dependency Count (Security Surface)
1. **Vanilla JS**: 0 runtime dependencies
2. **Alpine.js**: 1 dependency (or 0 with CDN)
3. **Svelte**: ~10-15 dev dependencies (compiler)
4. **Vue**: ~50+ total dependencies
5. **React**: ~100+ total dependencies

### Container Image Size Estimate
1. **Vanilla JS**: ~10 MB (nginx Alpine)
2. **Alpine.js**: ~10 MB (nginx Alpine)
3. **Svelte**: ~50 MB (multi-stage build)
4. **Vue**: ~50 MB (multi-stage build)
5. **React**: ~60 MB (multi-stage build)

---

## Recommendation: Vanilla JavaScript

### Primary Justification

For this specific use case, **Vanilla HTML/CSS/JavaScript** is the optimal choice.

**Why Vanilla JS wins:**

1. **Constitutional Alignment**: Perfectly aligns with Principle I (readability) - direct DOM manipulation is self-documenting, no framework abstractions to decode
2. **Minimal Security Surface**: Zero runtime dependencies means zero dependency vulnerabilities (Principle IV)
3. **Simplest Container**: Single-stage Dockerfile with nginx Alpine (~10 MB total)
4. **Right-sized Solution**: 8 fields with simple show/hide behavior does not justify framework complexity
5. **Fast Iteration**: No build step means instant feedback during development
6. **Easy Onboarding**: Any developer familiar with web standards can contribute

**Constitutional Compliance Summary:**
- Principle I (Readability): ✅ EXCELLENT
- Principle II (Container): ✅ EXCELLENT
- Principle III (Testing): ✅ ADEQUATE (with Jest + JSDOM setup)
- Principle IV (Security): ✅ EXCELLENT

### Implementation Strategy

**Phase 1: Core Form**
- Single `index.html` with form structure
- `styles.css` for gray example text styling
- `form.js` for placeholder behavior (~50 lines)
- `api.js` for submission logic (~50 lines)

**Phase 2: Admin View**
- `admin.html` for submissions list
- `admin.js` for fetching and rendering submissions (~100 lines)

**Phase 3: Testing Setup**
- Jest configuration for JSDOM environment
- Unit tests for placeholder toggling logic
- Unit tests for form validation
- Unit tests for API client functions

**Total Estimated Code**: ~300-400 lines including tests

### Alternative Recommendation: Alpine.js (if framework desired)

If a reactive framework is preferred for developer experience, **Alpine.js** is the runner-up choice.

**Alpine.js advantages:**
- Maintains HTML-first approach (excellent readability)
- Minimal dependencies (strong security posture)
- Reactive data binding reduces manual event listeners
- Still allows simple container deployment
- 15 KB framework is negligible for UX improvement

**When to choose Alpine.js over Vanilla:**
- If form expands beyond 8 fields
- If complex client-side validation logic is added
- If multiple developers unfamiliar with vanilla DOM APIs

### Why NOT React/Vue/Svelte

**React/Vue**: Massive over-engineering for an 8-field form
- 10x larger bundle size than needed
- Complex build toolchain adds container bloat
- 100+ dependencies create security scanning overhead
- Framework patterns add cognitive load without benefit

**Svelte**: Interesting middle ground, but still unnecessary
- Requires build step (adds complexity)
- Compilation model is overkill for static form
- Smaller ecosystem means less tooling support

---

## Testing Implementation Plan (Vanilla JS)

### Test Structure

```
frontend/
├── src/
│   ├── index.html
│   ├── admin.html
│   ├── js/
│   │   ├── form.js              # Form behavior logic
│   │   ├── api.js               # API client
│   │   └── admin.js             # Admin view logic
│   └── css/
│       └── styles.css
├── tests/
│   ├── form.test.js             # Test placeholder behavior
│   ├── api.test.js              # Test API calls (mocked)
│   └── admin.test.js            # Test admin rendering
├── jest.config.js               # Jest + JSDOM configuration
└── package.json                 # Jest dev dependency only
```

### Example Test Case

```javascript
// tests/form.test.js
import { initializeExampleBehavior } from '../src/js/form.js';

describe('Form placeholder behavior', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input
        type="text"
        id="test-field"
        placeholder="Example text"
        data-example="Example text">
    `;
    initializeExampleBehavior();
  });

  test('hides placeholder when user types', () => {
    const field = document.getElementById('test-field');

    field.value = 'User input';
    field.dispatchEvent(new Event('input'));

    expect(field.placeholder).toBe('');
  });

  test('restores placeholder when field cleared', () => {
    const field = document.getElementById('test-field');

    field.value = 'User input';
    field.dispatchEvent(new Event('input'));
    field.value = '';
    field.dispatchEvent(new Event('input'));

    expect(field.placeholder).toBe('Example text');
  });
});
```

### Test Coverage Target

- `form.js`: 85% coverage (placeholder logic, validation)
- `api.js`: 90% coverage (API calls with mocked fetch)
- `admin.js`: 80% coverage (rendering logic)

**Total suite runtime target**: < 2 seconds

---

## Container Strategy (Vanilla JS)

### Dockerfile

```dockerfile
FROM nginx:alpine

# Copy static files
COPY src/ /usr/share/nginx/html/

# Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80
```

**Image size**: ~10 MB
**Build time**: ~5 seconds
**No multi-stage build needed**: All files are static

### nginx.conf

```nginx
server {
  listen 80;

  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend:8000;
  }

  location /health {
    access_log off;
    return 200 "healthy\n";
  }
}
```

---

## Decision Matrix Summary

| Criteria | Vanilla JS | Alpine.js | Svelte | Vue | React |
|----------|-----------|-----------|--------|-----|-------|
| **Readability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Container Simplicity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Testing Support** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Security (Dependencies)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Bundle Size** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Development Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Right-sized for Use Case** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| **TOTAL** | **33/35** | **31/35** | **24/35** | **23/35** | **19/35** |

---

## Final Recommendation

**Use Vanilla HTML/CSS/JavaScript** for the project intake form frontend.

This recommendation is based on:
1. Constitutional requirement for code readability (Principle I)
2. Zero dependency security posture (Principle IV)
3. Simplest possible container deployment (Principle II)
4. Right-sized solution for 8-field form with simple interactivity
5. Fast development iteration without build tooling
6. Easy unit testing with Jest + JSDOM

The dynamic placeholder behavior can be implemented in ~50 lines of readable JavaScript using standard DOM APIs. This solution delivers all required functionality with minimal complexity, maximum maintainability, and zero framework lock-in.

If the project scope expands significantly (20+ fields, complex validation, real-time collaboration), reassess and consider Alpine.js as the next step up in framework complexity while maintaining constitutional compliance.
