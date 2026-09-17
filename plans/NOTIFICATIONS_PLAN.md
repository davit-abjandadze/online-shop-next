# Notifications Module — Implementation Plan

## კონტექსტი

საიტს სჭირდება ადმინის მიერ გაგზავნილი შეტყობინებების სისტემა (ss.ge-ს ტიპის bell/dropdown/modal
პატერნი): ადმინი წერს შეტყობინებას rich-text ედიტორში (ტექსტი, სურათი, ლინკები), ირჩევს ვის
გაეგზავნოს (ყველას თუ კონკრეტულ user(ებ)-ს), user-ი ხედავს bell icon-ზე unread count badge-ს,
დაჭერისას გვერდიდან იხსნება dropdown სია, სიაში ერთ item-ზე დაჭერისას — მოდალი სრული content-ით,
რასაც თან ერთვის mark-as-read.

დაზუსტებული გადაწყვეტილებები:
- **Real-time არ გვჭირდება** — client polling ყოველ 30 წუთში (unread-count ენდფოინთზე).
- **Content ფორმატი** — sanitized HTML string (rich-text ედიტორის, მაგ. TipTap/Quill, output-ი),
  არა structured JSON blocks.
- **Target** — ერთი შეტყობინება უნდა შესძლოს გავეგზავნოს ყველა user-ს ან კონკრეტულ user(ებ)-ს →
  `Notification` + `NotificationRecipient` join-ცხრილი (თითო user-ს თავისი read-სტატუსი).
- **სურათები** — ცალკე upload endpoint, ედიტორი embed-ავს დაბრუნებულ URL-ს content HTML-ში.

## Module structure

```
src/notifications/
  notifications.module.ts
  notifications.controller.ts       # admin routes
  notifications-user.controller.ts  # user-facing routes (ან ერთ კონტროლერში, prefix-ით გამიჯნული)
  notifications.service.ts
  entities/
    notification.entity.ts          # id, title, contentHtml, imageUrl?, createdBy(adminId), createdAt
    notification-recipient.entity.ts # id, notificationId, userId, isRead, readAt
  dto/
    create-notification.dto.ts      # title, contentHtml, imageUrl?, targetUserIds?: number[] (undefined = ყველა)
    notification-response.dto.ts
```

`NotificationsModule` → `TypeOrmModule.forFeature([Notification, NotificationRecipient, User])`,
რეგისტრირდება `src/app.module.ts`-ში. Admin routes `@AdminOnly()`-ის ქვეშ, user routes —
`@UseGuards(JwtAuthGuard)` + `@CurrentUser()`. `@ApiTags('Notifications')`, ქართული `@ApiOperation`
აღწერები, arსებული `PaginatedResponseDto`/`PaginationDto` პატერნის გამოყენებით სიებზე.

---

## Frontend

**სტატუსი: Phase F1–F4 დასრულებულია.**

### Phase F1 — Admin: ედიტორი ✅

- [x] F1.1 Rich-text ედიტორის ინტეგრაცია — არსებული `RichTextEditor` კომპონენტი
      (`components/pages/dashboard/RichTextEditor.tsx`, `document.execCommand`-ზე
      აგებული, TipTap/Quill-ის მძიმე დამოკიდებულების გარეშე) გამოყენებულია
      უცვლელად — bold/italic/underline/სია/ლინკი/ფერი/ზომა toolbar უკვე ჰქონდა.
- [x] F1.2 სურათის ატვირთვა ედიტორში → `POST /admin/notifications/upload-image` →
      URL embed (`NotificationsPage.tsx`-ის `handleFileChange`)
- [x] F1.3 Target audience selector — checkbox "ყველას გაგზავნა" ან
      react-select `isMulti` კონკრეტული user(ებ)-ის ძებნა/მონიშვნა
      (`ProductSliderItemsForm.tsx`-ის იგივე checkbox-option პატერნით)
- [x] F1.4 გაგზავნის ფორმა → `POST /admin/notifications`
      (`components/pages/dashboard/NotificationsPage.tsx`, route:
      `pages/dashboard/notifications.tsx`, nav ტაბი `DashboardLayout.tsx`-ში)

### Phase F2 — Admin: ისტორია ✅

- [x] F2.1 გაგზავნილი შეტყობინებების paginated სია (`GET /admin/notifications`)
- [x] F2.2 წაშლის მოქმედება (`ConfirmDialog` + `DELETE /admin/notifications/:id`)

### Phase F3 — User: bell + badge ✅

- [x] F3.1 Bell icon header-ში + unread-count badge, polling `GET /notifications/unread-count`
      ყოველ 30 წუთში (`context/Notifications/index.tsx` — `NotificationsProvider`,
      `_app.tsx`-ში ჩართული; ბელი — `components/shared/NotificationBell/`,
      `Header/index.tsx`-ში ჩასმული, მხოლოდ authenticated user-ისთვის)
- [x] F3.2 Dropdown სია ზარზე დაჭერისას (`GET /notifications`, "მეტის ჩვენება"
      ღილაკით გვერდიანი დატვირთვა infinite-scroll-ის მაგივრად)

### Phase F4 — User: მოდალი ✅

- [x] F4.1 სიის item-ზე დაჭერისას მოდალი სრული content-ით (`GET /notifications/:id`) +
      read-ის ავტომატური მარკირება (ბექენდზე უკვე ხდება `findOneForUser`-ში)
- [x] F4.2 "მონიშნე ყველა წაკითხულად" ღილაკი dropdown header-ში (`PATCH /notifications/read-all`)

---

## შემდეგი ნაბიჯი

Backend (B1–B5, `online-shop-nest`) და Frontend (F1–F4, `online-shop-next`) ორივე დასრულებულია.
დარჩენილი: ბრაუზერში ხელით გატესტვა (dev სერვერზე) — გაგზავნის ფორმა, ბელის dropdown/badge,
მოდალი+mark-as-read და 30წთ polling.
