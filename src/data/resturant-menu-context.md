# Restaurant Menu Framework

A mobile-first web framework that lets any restaurant deploy QR-code-based ordering without hardware. Customers scan a table QR code and order through a mobile browser.

## Language

**Customer**:
The anonymous person who scans the QR code, browses the menu, and places an order. No login or account required — a Customer exists only for the duration of a session.
_Avoid_: Guest, Diner, User

**Table**:
A numbered physical surface in a dine-in restaurant. The QR code sticker on the table encodes the Restaurant ID and Table number. Scoped exclusively to the dine-in Order Type — has no meaning in takeout.
_Avoid_: Seat, Station

**Order Type**:
The fulfillment mode chosen at QR scan time — either `dine-in` (food delivered to a Table) or `takeout` (Customer picks up at the counter). Encoded in the QR code URL. Drives layout, copy, and status language throughout the Customer-facing flow. Delivery is explicitly out of scope for the POC.
_Avoid_: Fulfillment mode, delivery channel (use "Order Type")

**Order Number**:
A system-assigned identifier generated at the moment an Order is submitted. Used by takeout Customers to identify their order at the counter. Never entered by the Customer — always assigned by the system.
_Avoid_: Pickup code, confirmation number

**Kitchen Display**:
The restaurant-side view used by kitchen staff. Shows the incoming order queue and lets staff advance Order Status (e.g. mark an order as preparing or ready). Separate from the Floor View, though both share the same real-time data. Full requirements to be validated with restaurant operators before finalising.
_Avoid_: Kitchen Dashboard, Admin Panel (too generic)

**Floor View**:
The restaurant-side view used by waitstaff. Shows which Tables have orders ready to be run. Separate from the Kitchen Display. Full requirements to be validated with restaurant operators before finalising.
_Avoid_: Waiter Dashboard, Table Dashboard

**Platform**:
The shared QR-code ordering framework — the fixed flow of scan → browse → order → kitchen receives — that every restaurant runs on. Restaurants do not customise the flow; they customise the Theme and supply Menu data.
_Avoid_: Framework, System, App (too generic)

**Operator**:
The restaurant business that signs up to use the Platform. An Operator configures their Theme, uploads their Menu, and receives Orders. Distinct from a Customer (who places orders) and from Staff (who work the kitchen and floor).
_Avoid_: Restaurant (use Restaurant for the data record), Merchant, Vendor, Tenant

**Restaurant**:
The data record that represents an Operator's presence on the Platform — name, slug, theme config, and the full Menu. One Operator owns one Restaurant record in the MVP; multi-location support is out of scope for the POC.
_Avoid_: Operator (use Operator for the business entity)

**Theme**:
The visual identity layer applied to a Restaurant — colors, typography, and decorative motifs. Two tiers: Standard (pick from pre-built palettes, fast deployment, default pricing) and Custom (fully bespoke branding, additional charge, longer onboarding). The ordering flow is identical regardless of tier.
_Avoid_: Skin, Style, Brand

**Standard Theme**:
A pre-built Theme palette an Operator selects during onboarding. Covers color scheme, font pairing, and a motif set. Fast to deploy — no design work required.
_Avoid_: Default theme, Basic theme

**Custom Theme**:
A fully bespoke Theme built to an Operator's brand spec. Carries an additional charge and a longer onboarding timeline. Unlocks full control over colors, typography, imagery, and motifs beyond the Standard palette.
_Avoid_: Premium theme, Branded theme

**Operator Portal**:
The Operator-facing web interface for configuring a Restaurant on the Platform. Covers Theme selection, Menu management, Staff PIN configuration, and order history. Distinct from the Customer-facing app and the Staff views (Kitchen Display, Floor View). Requires Operator-level authentication (not a PIN).
_Avoid_: Admin panel, Dashboard, Back-office (too generic)

**Operator Authentication**:
How an Operator proves their identity when accessing the Operator Portal. Uses Firebase Auth magic link (email link, passwordless) — Firebase handles email delivery natively, no separate email service required. Scoped to the Operator Portal only; Customers require no authentication and Staff use PINs.
_Avoid_: Login, Sign-in (use "Operator authentication" as the concept)

**Staff PIN**:
A short numeric code that grants access to a specific Staff view — one PIN for the Kitchen Display, one for the Floor View. Shared by all staff in that role; no individual accounts. Configured by the Operator in the Operator Portal. Designed for shared tablets in a busy kitchen environment.
_Avoid_: Password, Access code

**Bill Settlement**:
The act of paying and closing a dine-in Tab. Two paths: Request Bill (Customer requests, staff brings payment terminal — traditional flow) and Pay Now (Customer pays the full Tab directly in the browser via Stripe, staff receive an automatic notification, no waiter involvement required). Both paths result in the Tab being marked settled and the Table cleared.
_Avoid_: Checkout, Close tab, Pay bill

**Request Bill**:
A Bill Settlement path where the Customer taps a button in the app to signal they are ready to pay. The Floor View surfaces the request on that Table. Staff bring a card terminal or process payment manually. Customer waits for staff.
_Avoid_: Ask for check, Call waiter

**Pay Now**:
A Bill Settlement path where the Customer pays the full Tab directly in the browser using Stripe — no staff involvement. Staff receive a real-time notification on the Floor View that the Table has self-settled and is ready to be cleared. The fastest and most contactless closing path.
_Avoid_: Self-checkout, Mobile pay (too generic)

**Payment Timing**:
When payment is collected relative to Order submission. Dine-in: payment is deferred to end-of-meal — a Customer may submit multiple Orders across a session (drinks, mains, desserts) and pays once when closing the Table. Takeout: payment is collected immediately at Order submission before the kitchen starts preparing.
_Avoid_: Checkout timing, Payment mode

**Tab**:
The running total of all Orders placed at a dine-in Table during a single session. A Customer adds to the Tab by submitting additional Orders. The Tab is settled (paid and closed) once at the end of the meal.
_Avoid_: Bill, Check, Invoice (use Tab for the open running total, "settling" for the payment act)

**Menu Onboarding**:
The process by which an Operator's Menu data enters the Platform. Two paths: Photo Import (AI-assisted, fastest) and Sheet Import (manual template, fallback). Both paths produce the same Menu record in the database — the path is invisible to Customers.
_Avoid_: Menu upload, Data entry, Menu setup

**Photo Import**:
A Menu Onboarding path where the Operator photographs their existing paper menu, the image is sent to an LLM vision tool, and structured Menu data (categories, items, prices, modifiers) is extracted automatically. Requires human review before publishing. The fastest onboarding path.
_Avoid_: AI import, Image upload, OCR

**Sheet Import**:
A Menu Onboarding path where the Operator fills in a provided Google Sheets template and the data is imported via script. Fallback for Operators without a paper menu or whose Photo Import output needs significant correction.
_Avoid_: CSV import, Manual import, Spreadsheet upload

**Modifier Group**:
A named set of choices that customise a Menu Item — e.g. spice level, sauce, protein swap. Has a `required` flag and a `maxSelect` cap (1 = single-select, >1 = multi-select). Every option carries a `priceAdd` (zero if the choice is free). All per-dish customisation — including cuisine-specific attributes like spice level and numbing level — is modelled as a Modifier Group, never as flat fields on the Menu Item.
_Avoid_: Option group, Customisation, Add-on group

**Modifier Option**:
A single selectable choice within a Modifier Group — e.g. "Mild", "Fiery", "Extra Cheese". Carries a label and a `priceAdd`.
_Avoid_: Option, Choice, Variant

**Cart**:
A temporary, unconfirmed collection of Menu Items the Customer is building before submission. Lives in the browser only, has no ID, and can be freely edited (add, remove, change quantity). Ceases to exist the moment an Order is submitted.
_Avoid_: Basket, Bag

**Order**:
A confirmed, server-side record created the moment a Customer submits their Cart. Has an Order Number, an Order Type, and an Order Status. An Order in `cooking` status is appendable — new Menu Items can be added via an Order Amendment. Once status advances to `ready` or `paid`, amendments are blocked. A Cart becomes an Order exactly once; the transition is one-way.
_Avoid_: Transaction, Purchase, Booking

**Ordering Assistant**:
An AI-powered conversational feature that helps a Customer browse and order. Takes on a named Persona tied to the Restaurant's cuisine type. Asks about dietary preferences, recommends Menu Items, and can add items directly to the Customer's Cart. Accessible two ways: as a second entry button on the Landing page (for Customers who already know what they want) and as a floating chat button (bottom-right) on the Menu page (for Customers who get stuck mid-browse). The Customer interacts through a chat drawer — no navigation away is required. Recommended items are shown as inline dish cards with an explicit "Add to Cart" tap target — the Customer always confirms before an item enters the Cart. For Menu Items with required Modifier Groups, the Ordering Assistant asks about modifiers conversationally before presenting the final card. Complex multi-select modifiers fall back to the Item Detail page. The Ordering Assistant is Cart-aware (can see current unsubmitted items) but not Order-aware (does not read existing submitted Orders). The chat drawer stays open after items are added — the Customer controls when they are done and navigates to Cart themselves. Dietary preferences are captured conversationally at the start of each session and are not persisted — the Persona asks once per chat open.
_Avoid_: Chatbot, AI waiter, Virtual waiter, Assistant (too generic)

**Persona**:
The name, voice, and language character of the Ordering Assistant for a specific Restaurant. For the POC, Personas are pre-built per cuisine type (e.g. "Priya" for Indian, "Wei" for Sichuan). Operator-configurable Personas are a stretch goal — not in scope for the POC.
_Avoid_: Bot personality, AI character, Theme voice

**Order Amendment**:
The act of appending new Menu Items to an existing Order that is still in `cooking` status. Does not allow removal or modification of already-submitted items — only additions. Recalculates the Order subtotal, tax, and total. Blocked once the Order status is `ready` or `paid`.
_Avoid_: Order edit, Order update, Add to order

**Order Status**:
The current state of a submitted Order, pushed in real time to the Customer's browser. In dine-in: `placed → preparing → delivered`. In takeout: `placed → preparing → ready for pickup`. Staff advance the status from the Kitchen Display; the "ready" transition triggers a push notification to the Customer's Order Tracking screen.
_Avoid_: Order state
