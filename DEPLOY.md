# Deploy-ის სია (production)

ფრონტი (`online-shop-next`) და ბექენდი (`online-shop-nest`) **ერთ სერვერზე**, nginx-ის უკან.
ეს ფაილი ყველა ნაბიჯს და წვრილმანს აერთიანებს, რაც გაშვებისას დაგვჭირდება — გავდივართ ზემოდან ქვემოთ
და ვნიშნავთ `[x]`-ით.

> სტატუსი: პროექტი ჯერ production-ზე არ არის. ბოლო განახლება: 2026-09-25.

---

## 0. სქემა

```
ბრაუზერი ──HTTPS──> nginx (443)
                     ├── shop.ge        → Next    (127.0.0.1:3000)
                     └── api.shop.ge    → backend (127.0.0.1:5000)

Next სერვერი ──> backend (http://127.0.0.1:5000 — პირდაპირ, nginx-ის გარეშე)
backend      ──> Postgres
```

- ბრაუზერი ბექენდს **პირდაპირ** მიმართავს (`NEXT_PUBLIC_API_URL`), ამიტომ ბექენდს საჯარო მისამართი
  (ქვედომენი) სჭირდება. `/api` პრეფიქსი არ გამოდგება — ის Next-ის საკუთარ API route-ებს ეკუთვნის
  (`/api/auth/*`, `/api/upload-image`).
- ორივე პროცესი მხოლოდ `127.0.0.1`-ზე უსმენს — გარედან მხოლოდ nginx ჩანს.

---

## 1. გაშვებამდე ერთჯერადი საქმეები

- [ ] **Google OAuth client secret-ის როტაცია** (Google Cloud Console → Credentials). ძველი secret
      dev ბილდის bundle-ში მოხვდა — ძველი გააუქმეთ, ახალი ჩაწერეთ ორივე `.env`-ში.
- [ ] Google Console-ში **Authorized redirect URI**: `https://shop.ge/api/auth/callback/google` და
      **Authorized JavaScript origin**: `https://shop.ge`.
- [ ] **verify.ge — Starter ტარიფი.** Free tier SMS-ს მხოლოდ ტესტ-ნომრებზე აგზავნის; მის გარეშე
      რეგისტრაცია ნამდვილ ნომრებზე ვერ იმუშავებს (ან `PHONE_VERIFICATION_ENABLED=false`).
- [ ] **BOG** — კომპანიის რეგისტრაციამდე `PAYMENT_PROVIDER=mock` რჩება. რეალურზე გადასვლისას:
      `BOG_CLIENT_ID/SECRET`, `BOG_PUBLIC_KEY`, საჯარო `BOG_CALLBACK_URL`. (refund და callback-ის
      თანხის შემოწმება ამ გადასვლამდე განზრახ გადადებულია — იხ. ბექენდის CLAUDE.md.)
- [ ] **Gmail app password** (`EMAIL_USER`/`EMAIL_PASS`) — პაროლის აღდგენის წერილებისთვის.
      ჩვეულებრივი პაროლი არ იმუშავებს, საჭიროა 2FA + App Password.
- [ ] **ImgBB API key** (`IMGBB_API_KEY`) — ადმინში სურათების ატვირთვისთვის.
- [ ] ბექენდის `EmailService`-ში "from" სახელი ჯერ placeholder-ია (`"Online Shop"`) — შეცვალეთ
      მაღაზიის რეალურ სახელზე.

---

## 2. კოდში ჯერ დასაწერი (deploy-მდე)

- [ ] **`API_INTERNAL_URL`** — სერვერული ცვლადი ფრონტში (`http://127.0.0.1:5000`). NextAuth
      (`pages/api/auth/[...nextauth].ts`), `pages/api/auth/register.ts` და SSR-ის
      (`getServerSideProps`) API გამოძახებებმა ის უნდა გამოიყენონ `NEXT_PUBLIC_API_URL`-ის
      ნაცვლად. სხვაგვარად Next → nginx → backend გზა ორი hop-ია და `TRUST_PROXY=1` მცდარ IP-ს
      აიღებს (და ზედმეტი TLS round-trip-იც ემატება).
- [ ] **SSR-ის rate limit** — პროდუქტის/კატეგორიის გვერდების SSR მოთხოვნები ყველა Next-ის ერთი IP-დან
      მოდის და ბექენდის ზოგად ლიმიტს (120/წთ) იზიარებს → დატვირთვისას 429. გამოსავალი: SSR-მა
      კლიენტის `X-Forwarded-For` გადასცეს, ან შიდა მოთხოვნები throttler-ს გამოაკლდეს.
- [ ] **Dockerfile** — ახლა `yarn build`-ს უშვებს, რაც `ENVIRONMENT`-ის გარეშე **Dev** გარემოს
      აწყობს. უნდა იყოს `yarn build:prod` (ან `ENVIRONMENT=Production` build-ის დროს).
- [ ] `yarn generate:api` ფრონტში ბექენდის ბოლო swagger-ზე (ახალი nullable ველები,
      `OrderItem.originalUnitPrice`/`discountPercent`) — ახლა cast-ებით/ხელით ტიპებით მუშაობს.

---

## 3. ბექენდის `.env` (`online-shop-nest/.env`)

| ცვლადი | მნიშვნელობა / ნიმუში | შენიშვნა |
|---|---|---|
| `NODE_ENV` | `production` | **სავალდებულო.** გამორთავს `synchronize`-ს, ბუთზე migration-ებს უშვებს |
| `PORT` | `5000` | |
| `DB_HOST` `DB_PORT` `DB_USERNAME` `DB_PASSWORD` `DB_DATABASE` | | production ბაზა (არა `shop_db` dev კონტეინერი) |
| `DB_SSL_CA` | PEM ან ფაილის გზა | ცარიელი = დაშიფრულია, მაგრამ სერტიფიკატი არ მოწმდება |
| `JWT_SECRET` | `openssl rand -hex 32` | |
| `JWT_EXPIRES_IN` | `7d` | ფრონტი ტოკენის ვადის გასვლისას მომხმარებელს ავტომატურად გამოიყვანს |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` (64 hex) | ⚠️ **ერთხელ და სამუდამოდ.** შეცვლა ძველ დაშიფრულ პირად/ტელეფონის ნომრებს გაუშიფრავს ხდის. შეინახეთ უსაფრთხოდ (password manager) |
| `EMAIL_USER` `EMAIL_PASS` | Gmail + App Password | |
| `FRONTEND_URL` | `https://shop.ge` | პაროლის აღდგენის ბმულისთვის |
| `CORS_ORIGINS` | `https://shop.ge` | მძიმით გამოყოფილი; ცარიელზე მხოლოდ localhost დაიშვება |
| `GOOGLE_CLIENT_ID` | ფრონტის იგივე Client ID | ID token-ის `aud`-ის შემოწმებისთვის |
| `GOOGLE_CLIENT_SECRET` | ახალი (როტირებული) | |
| `TRUST_PROXY` | `1` | **არასდროს `true`.** სწორია მხოლოდ მე-5 სექციის nginx კონფიგით, თუ backend-ის პორტი გარედან დახურულია და Next ბექენდს `127.0.0.1`-ით მიმართავს (მე-2 სექცია) |
| `PAYMENT_PROVIDER` | `mock` → მოგვიანებით `bog` | |
| `BACKEND_URL` | `https://api.shop.ge` | mock პროვაიდერის ბმულებისთვის |
| `BOG_BASE_URL` `BOG_CLIENT_ID` `BOG_CLIENT_SECRET` `BOG_PUBLIC_KEY` | | მხოლოდ `bog`-ზე |
| `BOG_CALLBACK_URL` | `https://api.shop.ge/payments/callback/bog` | საჯარო უნდა იყოს |
| `VERIFY_GE_API_KEY` | | |
| `VERIFY_GE_BASE_URL` | ცარიელი | default `https://api.verify.ge/api/v1` |
| `PHONE_VERIFICATION_ENABLED` | ცარიელი (= ჩართული) | `false` მხოლოდ თუ verify.ge ტარიფი ჯერ არ გვაქვს |

---

## 4. ფრონტის `.env.production` (`online-shop-next`)

| ცვლადი | მნიშვნელობა / ნიმუში | შენიშვნა |
|---|---|---|
| `ENVIRONMENT` | `Production` | build-ის დროს უნდა იყოს ხელმისაწვდომი (`yarn build:prod`) |
| `NEXT_PUBLIC_BASE_URL` | `https://shop.ge` | canonical/OG/hreflang ბმულები |
| `NEXT_PUBLIC_API_URL` | `https://api.shop.ge` | ბრაუზერიდან ბექენდზე |
| `NEXT_PUBLIC_AUTH_URL` | `https://api.shop.ge/auth/login` | |
| `NEXT_PUBLIC_CDN_URL` | | ფარდობითი სურათების პრეფიქსი |
| `API_INTERNAL_URL` | `http://127.0.0.1:5000` | ⏳ მე-2 სექციის ცვლილების შემდეგ |
| `NEXTAUTH_URL` | `https://shop.ge` | **ზუსტად** საჯარო მისამართი, https-ით |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | მის გარეშე აპლიკაცია განზრახ არ ჩაირთვება |
| `GOOGLE_CLIENT_ID` `GOOGLE_CLIENT_SECRET` | ახალი (როტირებული) | |
| `IMGBB_API_KEY` | | |
| `NEXT_PUBLIC_FB_APP_ID` | სურვილისამებრ | გაზიარების ღილაკი (`ShareModal`) |
| `NEXT_PUBLIC_GA_ID` `NEXT_PUBLIC_GTM_ID` `NEXT_PUBLIC_CLARITY_ID` `NEXT_PUBLIC_INTERCOM_APP_ID` | სურვილისამებრ | კოდში ჯერ არ არის მიერთებული |

> ⚠️ `next.config.js`-ის `env{}` ბლოკი (`NEXTAUTH_SECRET`, `*_CLIENT_SECRET`) build-ის დროს კოდში
> ჩაიწერება. ეს უსაფრთხოა მხოლოდ მანამ, სანამ ამ ცვლადებს **მხოლოდ** `pages/api/**`-იდან
> მივმართავთ. `constants.ts`-ში ან კომპონენტში `process.env.*_SECRET` არასდროს.
> build-ის შემდეგ შემოწმება: `grep -rl "<secret-ის ნაწილი>" .next/static` — ცარიელი უნდა იყოს.

---

## 5. nginx

```nginx
# ორივე server ბლოკში (shop.ge და api.shop.ge):
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;   # ← აუცილებელი (rate limit)
proxy_set_header X-Forwarded-Proto $scheme;

# shop.ge
location / { proxy_pass http://127.0.0.1:3000; }

# api.shop.ge
client_max_body_size 12m;   # ადმინში base64 სურათები (Next-ის ლიმიტი 10mb)
location / { proxy_pass http://127.0.0.1:5000; }
```

- [ ] HTTPS (Let's Encrypt / certbot) ორივე დომენზე, http → https redirect.
- [ ] firewall: გარედან მხოლოდ 80/443 (და SSH). **3000, 5000 და Postgres-ის პორტი დახურული.**

---

## 6. ბილდი და გაშვება

**ბექენდი**
- [ ] `yarn install --frozen-lockfile && yarn build`
- [ ] migration-ების შემოწმება **ცარიელ** ბაზაზე: `yarn migration:run`, შემდეგ
      `yarn typeorm migration:generate src/migrations/X --check` (exit 0 = entity-ები და migration-ები
      ემთხვევა). ბოლო migration `1788130000000-AddOrderItemPriceSnapshot` ლოკალურად მხოლოდ
      `synchronize`-ით გაეშვა.
- [ ] production-ზე migration-ები ბუთზე თავად ეშვება (`NODE_ENV=production`).
- [ ] პროცესის მენეჯერი (pm2/systemd), ავტორესტარტით.

**ფრონტი**
- [ ] `yarn install --frozen-lockfile && yarn build:prod` (**არა** `yarn build`)
- [ ] `yarn start` pm2-ით (`ecosystem.json` უკვე არსებობს) ან systemd-ით.

**მნიშვნელოვანი:** ბექენდი ერთ ინსტანსად უნდა გაეშვას (pm2 `cluster`/`instances > 1` არა).
login-ის ბლოკირება და OTP-ის ერთჯერადობა მეხსიერებაშია — რამდენიმე ინსტანსისთვის Redis დაგვჭირდება.

---

## 7. გაშვების შემდეგ შემოწმება

- [ ] `https://api.shop.ge/health` → 200
- [ ] მთავარი, კატეგორია, პროდუქტი იხსნება ka/en/ru-ზე; `/ka/products/999999` → 404
- [ ] რეგისტრაცია ნამდვილი ნომრით (SMS კოდი მოდის) → ავტომატური შესვლა
- [ ] Google-ით შესვლა
- [ ] პაროლის აღდგენის წერილი მოდის და ბმული `FRONTEND_URL`-ზე მიდის
- [ ] კალათა → checkout (ვერიფიცირებული მომხმარებლით) → გადახდა (mock/BOG) → შეკვეთის გვერდი
- [ ] დაუდასტურებელი მომხმარებლით შეკვეთა → 400 "საჭიროა: …"
- [ ] ადმინი: პროდუქტის შექმნა სურათით, რედაქტირება, "ყველაფრის შენახვა"
- [ ] ანონიმურად `POST /api/upload-image` → 403
- [ ] rate limit: 6 არასწორი login ერთი ბრაუზერიდან → დაბლოკვა; **სხვა** მოწყობილობიდან შესვლა
      ამავე დროს მუშაობს (თუ ორივე იბლოკება — `TRUST_PROXY`/`X-Forwarded-For` არასწორადაა)
- [ ] `grep` secret-ზე `.next/static`-ში → ცარიელი
