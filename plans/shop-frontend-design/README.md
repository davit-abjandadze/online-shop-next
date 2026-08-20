# Shop frontend — design canvas source

Working source files for the UI mockup canvas designed against `01-shop-frontend-plan.md`.
Published (view/export + edit where saving is enabled) at:
https://claude.ai/code/artifact/e14dfe41-58a2-472f-b80f-1fb617649950

## Files

- `Main.dc.html` — Catalog (product grid, category/sort filters, pagination)
- `ProductDetail.dc.html` — Product detail page
- `Cart.dc.html` — Cart (has a boolean tweak to preview the empty-cart state)
- `Checkout.dc.html` — Checkout (shipping form + order summary)
- `Orders.dc.html` — Order history list (all 7 order statuses)
- `OrderDetail.dc.html` — Order detail with status timeline
- `PaymentStatus.dc.html` — BOG redirect-back page (tweak switches confirming/success/fail)
- `AdminProducts.dc.html` — Admin product table + edit modal
- `AdminOrders.dc.html` — Admin order table with inline status control
- `ProductCard.dc.html` — Shared card component, 3 stock states
- `canvas.json` — artboard layout for the canvas

Visual language (colors, radii, shadows, font) was lifted from this repo's
`styles/globals.css` `--ref-*` tokens and `components/shared/QuestionCard`/`Header`,
so it matches the existing app rather than inventing a new look.

To update the published canvas, re-seed with the design skill's helper against a fresh
copy of `payload.template.html`, then republish to the same URL above.
