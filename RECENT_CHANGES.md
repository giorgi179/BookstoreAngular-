# Recent Changes in StepisSualeduriProeqtiAngular

## რა შეიცვალა

1. დამატებულია ახალი ფაილი:
   - `src/app/service/api.ts`
     - ცენტრდება API მისამართი და კონსტანტები:
       - `API_BASE`
       - `USER_API`
       - `PAYMENT_API`
       - `BOOK_API`
       - `ADMIN_API`

2. ყველა პირდაპირი `https://localhost:7023/api` URL შეცვალა ცენტრალური კონსტანტებით:
   - `src/app/service/basket-service.ts`
   - `src/app/service/footer-service.ts`
   - `src/app/service/home-service.ts`
   - `src/app/service/auth.ts`
   - `src/app/service/admin.ts`
   - `src/app/component/basket/basket.ts`
   - `src/app/component/card-system/card-system.ts`
   - `src/app/component/change-password/change-password.ts`
   - `src/app/component/contact/contact.ts`
   - `src/app/component/profile/profile.ts`

3. `npm run build` შესრულდა წარმატებით.
   - აპლიკაცია კომპილირდა და `dist/StepisSualeduriProeqtiAngular` შექმნილია.
   - აღმოჩნდა მხოლოდ SCSS-ის Dart Sass-ის გაფრთხილებები (`darken`, `lighten`) `src/app/component/profile/profile.scss`-ში.

## რატომ

- ყველა API მისამართის ცენტრალიზაცია ხელს უწყობს ადვილ ლოკალურ ან სხვა გარემოში გადართვას.
- წინა მოდულებში არანაირი პირდაპირი `https://localhost:7023/api` URL აღარ არის, გარდა `src/app/service/api.ts`-ში განმარტებული ძირითადი კონსენტანტის.

## სხვა შენიშვნა

- ფაილი `src/app/app.scss` ცარიელია და სტილი ძირითადად ნაგებია თითოეული კომპონენტის SCSS ფაილებში.
- პროექტი უკვე მზად არის დამატებითი ვიზუალური და ლოჯიკური გაუმჯობესებისთვის.
