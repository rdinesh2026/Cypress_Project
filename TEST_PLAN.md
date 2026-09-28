# SauceDemo Cypress End-to-End Test Plan

## 1. Document Control

| Item | Value |
| --- | --- |
| Application | [SauceDemo / Swag Labs](https://www.saucedemo.com/) |
| Test framework | Cypress with TypeScript |
| Design pattern | Page Object Model (POM) |
| Parallel execution | `cypress-parallel` |
| CI | GitHub Actions |
| Status | Plan only; implementation has not started |
| Plan version | 1.0 |

## 2. Objective

Define repeatable end-to-end coverage for the currently observable SauceDemo storefront: authentication, product catalog, sorting, product details, cart operations, checkout, order completion, navigation, and supported demo-account behavior. Tests will validate user-visible outcomes and critical flow integration while keeping each spec independent and suitable for parallel execution.

“Complete coverage” here means all functional flows exposed by the current demo UI and the documented demo accounts, plus relevant negative and boundary cases. It does not imply coverage of unavailable backend or commerce capabilities.

## 3. Scope

### In scope

- Login and logout for the published demo accounts.
- Authentication validation and locked-account behavior.
- Six catalog products, product detail navigation, add/remove actions, cart badge, and all four sort modes.
- Cart contents, removal, continue shopping, and checkout entry.
- Checkout information validation, cancel paths, overview totals, finish action, and completion state.
- Menu navigation, reset-app-state behavior, and navigation guards for unauthenticated users.
- Regression characterization of the documented special users (`problem_user`, `performance_glitch_user`, `error_user`, and `visual_user`).
- Basic keyboard, responsive-layout, and accessibility smoke checks on critical screens.
- CI reporting/artifacts and parallel-safe execution.

### Out of scope / not offered by this demo

- Real payment processing, selectable shipping methods, shipping charges, or actual fulfillment.
- User registration, password reset, profile management, inventory quantities, discounts, taxes configured by region, or persistent order history.
- Tests against Sauce Labs production services or external social links beyond verifying the link target.
- Load, stress, security penetration, or exhaustive cross-browser certification.
- Exact screenshot/visual baselines until an approved baseline and stable rendering environment exist.

## 4. Application Facts and Test Data

The live demo was inspected at plan creation. The storefront displayed six products; sorting options were Name A-Z, Name Z-A, Price low-high, and Price high-low. Checkout displayed SauceCard `#31337`, free Pony Express delivery, and a calculated tax/total. The figures below are seed-data expectations and should be verified in tests from the rendered UI rather than duplicated as implementation assumptions where possible.

### Published accounts

| Username | Expected use |
| --- | --- |
| `standard_user` | Baseline successful functional flows |
| `locked_out_user` | Login rejection and error presentation |
| `problem_user` | Defect-characterization/regression flows; do not use for baseline assertions that assume a defect-free UI |
| `performance_glitch_user` | Login and critical flow with a generous bounded timeout; do not encode exact response duration |
| `error_user` | Defect-characterization/regression flows for cart/product actions |
| `visual_user` | Visual/DOM regression characterization |

Password for the published users: `secret_sauce`. Use environment variables for credentials in implementation; these are public demo credentials, not secrets.

### Product fixtures

| Product | Price |
| --- | ---: |
| Sauce Labs Backpack | $29.99 |
| Sauce Labs Bike Light | $9.99 |
| Sauce Labs Bolt T-Shirt | $15.99 |
| Sauce Labs Fleece Jacket | $49.99 |
| Sauce Labs Onesie | $7.99 |
| Test.allTheThings() T-Shirt (Red) | $15.99 |

Use product names as stable identifiers, not array positions. For multi-item totals, compute expected subtotal from the fixture and compare displayed values using decimal-safe integer cents.

## 5. Test Approach

- **Primary browser:** Chromium in CI; run local Cypress headed or headless during development.
- **Base URL:** `https://www.saucedemo.com`; configure in Cypress rather than scattering URLs through tests.
- **Selectors:** Prefer the app’s `data-test` attributes where available. Fall back to accessible roles/names and visible text; avoid brittle CSS classes and positional selectors.
- **Assertions:** Check route/state transitions, visible feedback, product identity, cart count, and calculated totals. Avoid asserting internal implementation details.
- **State isolation:** Each spec logs in and creates its own cart state. Do not rely on spec order, prior tests, or shared browser storage. Clear cookies/local storage between tests as appropriate.
- **Special users:** Keep expected defects as explicit characterization tests or a separately tagged suite. Do not weaken standard-user assertions to accommodate defects.
- **Timing:** Prefer Cypress retryable assertions. Add bounded timeouts only for the performance-glitch account; never use fixed sleeps as synchronization.
- **Cleanup:** Use the app’s reset control where useful, while still making every test establish its own preconditions.
- **Page objects:** Page objects expose user actions and locator access; tests own assertions and business expectations. Keep reusable authentication/session setup in a Cypress custom command or support helper, not duplicated in every test.

## 6. Scenario Inventory

Priority: **P0** = release-blocking core flow; **P1** = important functional/regression coverage; **P2** = secondary usability/compatibility coverage.

### A. Authentication and session

| ID | Pri. | Scenario | Expected result |
| --- | --- | --- | --- |
| AUTH-01 | P0 | Log in as `standard_user` with valid credentials | Inventory page opens; products and sort control are visible. |
| AUTH-02 | P1 | Submit login with both fields blank | Login is rejected with a visible required-field error; user remains logged out. |
| AUTH-03 | P1 | Submit with username blank and password populated | Login is rejected and username validation is shown. |
| AUTH-04 | P1 | Submit with password blank and username populated | Login is rejected and password validation is shown. |
| AUTH-05 | P1 | Submit unknown username and valid demo password | Login is rejected with an authentication error; inventory is not exposed. |
| AUTH-06 | P1 | Submit valid username and incorrect password | Login is rejected with an authentication error. |
| AUTH-07 | P0 | Log in as `locked_out_user` | Login is rejected with the locked-out message; inventory is not shown. |
| AUTH-08 | P1 | Log out from an authenticated session using the menu | Login page appears; protected inventory/cart/checkout routes are not available as an authenticated session. |
| AUTH-09 | P1 | Open an authenticated route directly while logged out | User is redirected to or shown the login state; protected content is not usable. |
| AUTH-10 | P1 | Reload inventory after a successful login | Application remains in a valid authenticated state or returns a documented login state without a broken page. |
| AUTH-11 | P1 | Use Reset App State from the menu after adding items | Cart badge and add/remove controls return to the empty-cart state. |

### B. Product catalog, sorting, and detail

| ID | Pri. | Scenario | Expected result |
| --- | --- | --- | --- |
| CAT-01 | P0 | Load catalog as `standard_user` | Exactly the six expected products are rendered with names, descriptions, prices, images, and add controls. |
| CAT-02 | P1 | Sort products Name A-Z | Product names are in ascending alphabetical order. |
| CAT-03 | P1 | Sort products Name Z-A | Product names are in descending alphabetical order. |
| CAT-04 | P1 | Sort products Price low-high | Prices are nondecreasing; equal-priced products remain valid ties. |
| CAT-05 | P1 | Sort products Price high-low | Prices are nonincreasing; equal-priced products remain valid ties. |
| CAT-06 | P1 | Open each product from its name or image | Correct product detail is shown, including matching name, description, price, and image. |
| CAT-07 | P1 | Add a product from its detail page | Cart badge increments and that product’s control changes to Remove. |
| CAT-08 | P1 | Return from product detail to catalog | Catalog navigation works and the user’s cart state is retained. |
| CAT-09 | P1 | Add one product, then add a second distinct product | Badge reflects two items; both controls indicate they are added. |
| CAT-10 | P1 | Remove an added product from the catalog | Badge decrements and the product’s control returns to Add to cart. |
| CAT-11 | P2 | Navigate to About from the menu | Link points to Sauce Labs; treat the external destination as a separate-site check. |

### C. Cart

| ID | Pri. | Scenario | Expected result |
| --- | --- | --- | --- |
| CART-01 | P1 | Open cart with no products added | Empty cart is shown. The live demo still allows checkout; this is recorded as observed behavior, not an expected commerce safeguard. |
| CART-02 | P0 | Add one product and open cart | Correct product, quantity, description, and price are shown; badge matches cart contents. |
| CART-03 | P0 | Add multiple different products and open cart | Each selected item appears once; the cart badge equals the number of selected products. |
| CART-04 | P1 | Remove an item from cart | Removed item disappears and badge updates; remaining items are unchanged. |
| CART-05 | P1 | Remove the final item from cart | Cart is empty and badge is empty/zero according to UI behavior. |
| CART-06 | P1 | Continue Shopping from cart | Inventory page opens and previously selected cart items remain selected. |
| CART-07 | P1 | Open product detail from a cart line item | Matching product detail appears; returning to cart preserves cart contents. |
| CART-08 | P1 | Reload cart with selected items | Cart contents remain coherent for the active session and badge matches. |
| CART-09 | P1 | Change catalog sort after adding items | Sort changes display order only; selected cart contents are retained. |

### D. Checkout and order completion

| ID | Pri. | Scenario | Expected result |
| --- | --- | --- | --- |
| CHK-01 | P0 | Start checkout with a nonempty cart | Checkout information form opens and contains first name, last name, and ZIP/postal code. |
| CHK-02 | P0 | Continue with all checkout fields blank | Checkout does not advance; a required-field error is displayed. |
| CHK-03 | P1 | Submit only first name | Checkout remains on information form; missing last name is reported. |
| CHK-04 | P1 | Submit first and last name but omit ZIP/postal code | Checkout remains on information form; missing ZIP/postal code is reported. |
| CHK-05 | P1 | Submit punctuation, spaces, and ordinary international text in name fields with a valid postal value | Values are accepted or validation feedback is clear; no crash or malformed transition occurs. Confirm actual supported constraints during implementation. |
| CHK-06 | P1 | Cancel checkout information | User returns to cart; cart contents remain intact. |
| CHK-07 | P0 | Submit valid checkout information | Overview shows correct cart lines, payment information, shipping information, subtotal, tax, and total. |
| CHK-08 | P0 | Validate total calculation for one product | Total equals item subtotal plus displayed tax; use integer cents for comparison. |
| CHK-09 | P1 | Validate total calculation for multiple products | Item subtotal equals the sum of product prices; displayed tax and total are arithmetically consistent. |
| CHK-10 | P1 | Cancel from checkout overview | User returns to inventory; order is not completed and selected cart state follows application behavior. |
| CHK-11 | P0 | Finish valid checkout | Completion page shows successful-order confirmation; cart is empty. |
| CHK-12 | P1 | Return Back Home from completion | Inventory page opens with empty cart and usable product actions. |
| CHK-13 | P2 | Use Generate PDF order action | PDF action produces a download or expected browser response; validate only once actual behavior is confirmed in Cypress/CI. |
| CHK-14 | P1 | Attempt direct access to checkout overview/completion without valid preceding state | No false successful order is presented; app returns to a valid route/state. |
| CHK-15 | P1 | Complete checkout with an empty cart | Characterize the current demo behavior: it permits checkout, shows a zero total, and displays the completion confirmation. Track as a product gap, not as a desired commerce rule. |

### E. Menu, state, and special-account characterization

| ID | Pri. | Scenario | Expected result |
| --- | --- | --- | --- |
| NAV-01 | P1 | Open and close the navigation menu | Menu controls are operable and menu state is reflected accessibly. |
| NAV-02 | P1 | Select All Items from a non-inventory authenticated page | Inventory page opens without losing the active cart. |
| NAV-03 | P1 | Use menu logout from cart and checkout | Logout completes and authenticated session is no longer usable. |
| SPEC-01 | P1 | Run core catalog/cart smoke as `problem_user` | Record observed defects separately; test should detect known mismatch without misclassifying it as a standard-user regression. |
| SPEC-02 | P1 | Run login and a bounded catalog smoke as `performance_glitch_user` | Flow completes within a generous configured timeout; no fixed-delay expectation. |
| SPEC-03 | P1 | Run add/remove/cart smoke as `error_user` | Record and assert the documented account-specific behavior once characterized; maintain a separate expectation from `standard_user`. |
| SPEC-04 | P2 | Inspect key catalog visuals as `visual_user` | Detect only agreed visual/DOM regressions; avoid brittle screenshot snapshots without controlled baseline. |
| SPEC-05 | P1 | Run the complete core purchase flow using `standard_user` | Successful purchase remains defect-free and is the primary release gate. |

### F. Accessibility and responsive smoke

| ID | Pri. | Scenario | Expected result |
| --- | --- | --- | --- |
| UX-01 | P2 | Complete login using keyboard only | Fields and submit action are reachable in logical order and operable. |
| UX-02 | P2 | Navigate catalog, cart, and checkout using keyboard | Interactive controls can be focused and activated; focus remains visible. |
| UX-03 | P2 | Check accessible names for critical controls | Login fields, cart, sorting, product actions, checkout controls, and menu actions have meaningful names. |
| UX-04 | P2 | Smoke login, catalog, cart, and checkout at desktop and narrow mobile viewport sizes | Content and primary controls remain visible/usable without blocking overlap or broken navigation. |

## 7. Proposed Spec Organization and POM Boundaries

Final names can be adjusted during implementation, but keep specs grouped by workflow so Cypress parallelization has enough independently runnable work.

```text
cypress/
  e2e/
    auth.cy.ts
    catalog.cy.ts
    product-details.cy.ts
    cart.cy.ts
    checkout-validation.cy.ts
    checkout-purchase.cy.ts
    navigation-state.cy.ts
    special-users.cy.ts
  pages/
    LoginPage.ts
    InventoryPage.ts
    ProductPage.ts
    CartPage.ts
    CheckoutInformationPage.ts
    CheckoutOverviewPage.ts
    CheckoutCompletePage.ts
  support/
    commands.ts
    e2e.ts
  fixtures/
    products.json
```

POM responsibilities:

- Page objects own selectors and page-level actions (for example, `login`, `sortBy`, `addProduct`, `removeProduct`, `continueCheckout`).
- Specs own assertions, test data selection, and expected business behavior.
- Prefer composable page methods over a single helper that hides an entire scenario.
- A custom login command may use `cy.session()` only after confirming reliable session behavior; tests must still prove login independently and should avoid session caching for login-validation cases.

## 8. Parallel Execution Plan

- Install and pin `cypress-parallel` as a development dependency alongside Cypress and TypeScript.
- Keep each spec independently executable and ensure setup/cleanup does not depend on execution order.
- Use `cypress-parallel` to distribute spec files across a configurable worker count; begin with four workers in CI and tune based on observed runtime/stability.
- Suggested scripts after implementation (names are proposals):

```json
{
  "cy:run": "cypress run",
  "cy:run:parallel": "cypress-parallel -s cy:run -d cypress/e2e -t 4"
}
```

- Do not run the same account’s mutable cart workflow concurrently if the app’s state is server-shared. Confirm session/cart isolation during a parallel smoke run; reduce worker count or separate conflicting suites if interference is observed.
- Validate a single-worker full run first, then parallel execution. Compare outcomes and investigate order-dependent failures rather than retrying them into apparent success.
- Cypress Cloud recording is not required by this plan; `cypress-parallel` performs local/CI spec distribution and should not be confused with Cypress Cloud orchestration.

## 9. GitHub Actions CI/CD Plan

Create a workflow (proposed path: `.github/workflows/e2e.yml`) with:

- Triggers: `push`, `pull_request`, and `workflow_dispatch`.
- Runner: `ubuntu-latest`; Node.js LTS pinned consistently with local development.
- Install: checkout repository, configure Node/npm cache, run `npm ci`.
- Validation: run TypeScript/build checks if configured, then execute the Cypress parallel script.
- Results: upload Cypress screenshots, videos (if enabled), and test artifacts with `if: always()` so failures remain diagnosable.
- Failure policy: required check for pull requests; do not silently swallow Cypress exit codes. Use retries only as diagnostic mitigation and preserve the initial failure in artifacts/logs.
- Concurrency: cancel superseded runs for the same pull request/branch where appropriate.
- Security: use the minimum GitHub token permissions; do not commit credentials. Demo credentials can be configured in environment variables, with public test credentials as a documented fallback.
- Browser: run the supported Cypress-bundled Electron/Chromium browser initially. Add another browser only if compatibility requirements warrant its CI cost.

Acceptance criteria for CI: a clean checkout can install reproducibly, run the complete agreed P0/P1 suite in parallel, return nonzero on test failure, and preserve useful failure artifacts.

## 10. Execution and Coverage Gates

### Entry criteria

- Cypress project and TypeScript configuration are installed and reproducible via lockfile.
- Base URL and supported browser are configured.
- Selectors are stable and the test environment can reach SauceDemo.
- Product/account data and special-user expectations have been confirmed against the live demo.

### Exit criteria

- All P0 scenarios pass on `standard_user`.
- All P1 scenarios pass, except any explicitly documented special-account characterization/known demo defect with agreed expected result.
- No unexplained flaky or order-dependent failures in the agreed parallel run.
- Pull-request GitHub Actions workflow is green and failure artifacts are available.
- P2 failures are documented and triaged; they do not block the initial functional release unless product requirements say otherwise.

### Reporting

Capture run URL/commit, browser, worker count, passed/failed/pending counts, duration, failed scenario IDs, screenshots/videos, and known special-account issues. Keep special-user characterization results visibly separate from standard-user release health.

## 11. Risks and Open Decisions

- SauceDemo is a public demo and can change independently; assertions should use visible semantics and the product list should be checked if the catalog changes.
- The unusual accounts intentionally exercise nonstandard behavior. Their exact defects should be re-confirmed before encoding expected failures or special assertions.
- The app’s persistence/isolation behavior under concurrent sessions needs an early parallel smoke test; this determines whether four workers are safe.
- PDF download behavior and direct-route handling need Cypress-specific confirmation during implementation.
- Confirm desired CI browser matrix, whether P2 accessibility checks should be automated with a plugin, and whether screenshots should be compared visually.
- Tax is presented as a demo-calculated value; avoid asserting a universal tax rate unless the value is confirmed stable and treated as part of the demo contract.

## 12. Approval Gate Before Implementation

Review the scenario scope, priority split, special-account treatment, four-worker starting point, and CI triggers. Once approved, implementation should begin with the Cypress/TypeScript scaffold and a small vertical slice: standard-user login through successful checkout, followed by the remaining scenario groups and CI wiring.