import React from 'react';
import styled from 'styled-components';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

// --- Styled Components Definition ---

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  margin-top: 40px;
  background: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.7;
  color: #1f2937;
  background-color: #ffffff;

  @media (max-width: 640px) {
    padding: 20px 15px;
    border-radius: 0;
    box-shadow: none;
    border: none;
  }
`;

const PageHeader = styled.header`
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 20px;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #1e3a8a;
  font-size: 1.8rem;
  margin: 0 0 10px 0;

  @media (max-width: 640px) {
    font-size: 1.4rem;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 20px;
  color: #64748b;
  font-size: 0.9rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;

  strong {
    color: #334155;
    margin-right: 4px;
  }
`;

const IntroBox = styled.div`
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 15px 20px;
  margin-bottom: 30px;
  border-radius: 0 8px 8px 0;
  font-size: 0.95rem;

  p {
    margin: 0 0 10px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const Section = styled.section`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: #1e3a8a;
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
`;

const Paragraph = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.98rem;

  strong {
    color: #111827;
  }
`;

const List = styled.ul`
  margin: 0 0 15px 0;
  padding-left: 20px;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
  font-size: 0.98rem;
`;

const PageFooter = styled.footer`
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
`;

// --- Component ---

export const TermsAndConditions = () => {
  return (
    <>
      <Header />
      <Container>
      <PageHeader>
        <Title>წესები და პირობები (Terms and Conditions)</Title>
        <MetaInfo>
          <MetaItem>
            <strong>პლატფორმა:</strong> ონლაინ მაღაზია
          </MetaItem>
          <MetaItem>
            <strong>ბოლო განახლების თარიღი:</strong> 16 სექტემბერი, 2026 წელი
          </MetaItem>
        </MetaInfo>
      </PageHeader>

      <IntroBox>
        <p>
          კეთილი იყოს თქვენი მობრძანება ჩვენს ონლაინ მაღაზიაში (შემდგომში — „პლატფორმა“, „მაღაზია“, „ჩვენ“). გთხოვთ, ყურადღებით გაეცნოთ წინამდებარე წესებსა და პირობებს პლატფორმით სარგებლობამდე.
        </p>
        <p>
          პლატფორმაზე რეგისტრაციით, ავტორიზაციით, პროდუქტების დათვალიერებით ან შეკვეთის განთავსებით, თქვენ ადასტურებთ, რომ სრულად ეთანხმებით მოცემულ პირობებს.
        </p>
      </IntroBox>

      <Section>
        <SectionTitle>1. ზოგადი დებულებები და პლატფორმის დანიშნულება</SectionTitle>
        <Paragraph>
          <strong>1.1.</strong> პლატფორმა წარმოადგენს ონლაინ სავაჭრო სივრცეს, სადაც მომხმარებელს შეუძლია დაათვალიეროს პროდუქტების კატალოგი, განათავსოს შეკვეთა და შეიძინოს პროდუქცია დისტანციურად.
        </Paragraph>
        <Paragraph>
          <strong>1.2.</strong> პლატფორმაზე განთავსებული პროდუქტების აღწერილობა, ფასები და ხელმისაწვდომობა შეიძლება დროდადრო შეიცვალოს წინასწარი გაფრთხილების გარეშე.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>2. მომხმარებლის როლები და წვდომის დონეები</SectionTitle>
        <Paragraph>
          <strong>2.1. სტუმარი (არაავტორიზებული პირი):</strong> უფლება აქვს დაათვალიეროს პროდუქტების კატალოგი, კატეგორიები და ფილიალების ინფორმაცია. შეკვეთის გასაფორმებლად საჭიროა ანგარიშის შექმნა ან ავტორიზაცია.
        </Paragraph>
        <Paragraph>
          <strong>2.2. ავტორიზებული მომხმარებელი:</strong> სარგებლობს სრული ფუნქციონალით — პროდუქტების კალათაში დამატება, შეკვეთის გაფორმება, სასურველი პროდუქტების სიის („Wishlist“) მართვა, შეკვეთების ისტორიის ნახვა და პერსონალური პროფილის მართვა.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>3. რეგისტრაცია და ანგარიშის უსაფრთხოება</SectionTitle>
        <Paragraph>
          <strong>3.1.</strong> რეგისტრაცია შესაძლებელია როგორც ელ-ფოსტითა და პაროლით, ასევე მესამე მხარის სერვისებით (OAuth — Google, Facebook).
        </Paragraph>
        <Paragraph>
          <strong>3.2.</strong> მომხმარებელი ვალდებულია რეგისტრაციისა და შეკვეთის გაფორმებისას მიუთითოს რეალური და უტყუარი მონაცემები (მათ შორის: სახელი, გვარი, საკონტაქტო ტელეფონი, მიწოდების მისამართი), რაც აუცილებელია შეკვეთის სწორად დამუშავებისა და მიწოდებისთვის.
        </Paragraph>
        <Paragraph>
          <strong>3.3.</strong> მომხმარებელი თავად არის პასუხისმგებელი საკუთარი პაროლისა და ანგარიშის უსაფრთხოებაზე და ანგარიშზე განხორციელებულ ნებისმიერ მოქმედებაზე.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>4. შეკვეთის გაფორმება და გადახდა</SectionTitle>
        <Paragraph>
          <strong>4.1. შეკვეთის დადასტურება:</strong> შეკვეთა ითვლება მიღებულად მხოლოდ პლატფორმის მიერ დადასტურების შემდეგ. დადასტურებამდე პროდუქტის ხელმისაწვდომობა და ფასი შეიძლება დაზუსტდეს.
        </Paragraph>
        <Paragraph>
          <strong>4.2. ფასები:</strong> პროდუქტების ფასები მითითებულია ეროვნულ ვალუტაში და მოიცავს კანონმდებლობით გათვალისწინებულ გადასახადებს, თუ სხვა რამ არ არის მითითებული.
        </Paragraph>
        <Paragraph>
          <strong>4.3. გადახდის მეთოდები:</strong> გადახდა შესაძლებელია პლატფორმაზე ხელმისაწვდომი გადახდის საშუალებებით (საბანკო ბარათი, ონლაინ გადახდის სისტემები და სხვა). ყველა ტრანზაქცია მუშავდება უსაფრთხო, დაშიფრული არხებით.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>5. მიწოდება, ფილიალები და დაბრუნება</SectionTitle>
        <Paragraph>
          <strong>5.1. მიწოდება:</strong> შეკვეთის მიწოდება ხორციელდება მომხმარებლის მიერ მითითებულ მისამართზე ან შერჩეულ ფილიალში, პლატფორმაზე მითითებული ვადებისა და პირობების შესაბამისად.
        </Paragraph>
        <Paragraph>
          <strong>5.2. ფილიალიდან გატანა:</strong> მომხმარებელს შეუძლია შეკვეთის დროს აირჩიოს ფილიალიდან თვითგატანის ვარიანტი, ხელმისაწვდომი ფილიალების სიიდან.
        </Paragraph>
        <Paragraph>
          <strong>5.3. დაბრუნება და გაცვლა:</strong> პროდუქტის დაბრუნება ან გაცვლა შესაძლებელია საქართველოს მოქმედი კანონმდებლობითა და პლატფორმის მიერ დადგენილი ვადებისა და პირობების შესაბამისად, პროდუქტის ხარვეზისა თუ სხვა საფუძვლის მითითებით.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>6. ანგარიშის შეჩერება და გაუქმება (Soft Delete)</SectionTitle>
        <Paragraph>
          <strong>6.1.</strong> ადმინისტრაცია იტოვებს უფლებას, გააფრთხილოს, დროებით შეუჩეროს წვდომა ან დაბლოკოს მომხმარებელი, რომელიც არღვევს წინამდებარე წესებს ან ცდილობს სისტემის მუშაობის შეფერხებას.
        </Paragraph>
        <Paragraph>
          <strong>6.2.</strong> მომხმარებელს ნებისმიერ დროს შეუძლია საკუთარი ანგარიშის დეაქტივაცია (Soft Delete). დეაქტივაციის შემდეგ ანგარიში ხდება არააქტიური, თუმცა უკვე გაფორმებული შეკვეთების ისტორია აღრიცხვის მიზნით რჩება სისტემაში.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>7. რეკლამა და მესამე მხარის სერვისები</SectionTitle>
        <Paragraph>
          <strong>7.1.</strong> პლატფორმა შეიძლება იყენებდეს Google AdSense-სა და მესამე მხარის სარეკლამო/ანალიტიკურ ქსელებს.
        </Paragraph>
        <Paragraph>
          <strong>7.2.</strong> მომხმარებლის ეკრანზე რეკლამების ჩვენება და შესაბამისი სკრიპტების ჩატვირთვა რეგულირდება საერთაშორისო სტანდარტებით (მათ შორის GDPR თანხმობის მექანიზმით).
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>8. პასუხისმგებლობის შეზღუდვა</SectionTitle>
        <Paragraph>
          <strong>8.1.</strong> პლატფორმის ადმინისტრაცია არ აგებს პასუხს პროდუქტის იმ თვისებებზე, რომლებიც დამოკიდებულია მწარმოებელზე ან მიმწოდებელზე და არ არის გამოწვეული პლატფორმის ბრალეულობით.
        </Paragraph>
        <Paragraph>
          <strong>8.2.</strong> ადმინისტრაცია არ იძლევა გარანტიას, რომ სერვისი იმუშავებს შეუფერხებლად ფორს-მაჟორული სიტუაციების, პროვაიდერის შეფერხებების ან გეგმიური ტექნიკური სამუშაოების დროს.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>9. ცვლილებები პირობებში</SectionTitle>
        <Paragraph>
          ადმინისტრაცია იტოვებს უფლებას, დროდადრო განაახლოს წინამდებარე დოკუმენტი. ცვლილებების შესახებ მომხმარებლები ინფორმირებულნი იქნებიან საიტის შიდა შეტყობინებების სისტემით ან ვებ-გვერდზე შესაბამისი ინფორმაციის განთავსებით.
        </Paragraph>
      </Section>

      <PageFooter>
        &copy; 2026 ონლაინ მაღაზია - ყველა უფლება დაცულია.
      </PageFooter>
      </Container>
      <Footer />
    </>
  );
};

export default TermsAndConditions;
