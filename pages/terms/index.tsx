import React from 'react';
import styled from 'styled-components';

// --- Styled Components Definition ---

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
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

const Header = styled.header`
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

const Footer = styled.footer`
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
    <Container>
      <Header>
        <Title>წესები და პირობები (Terms and Conditions)</Title>
        <MetaInfo>
          <MetaItem>
            <strong>პლატფორმა:</strong> Evote.ge
          </MetaItem>
          <MetaItem>
            <strong>ბოლო განახლების თარიღი:</strong> 18 აგვისტო, 2026 წელი
          </MetaItem>
        </MetaInfo>
      </Header>

      <IntroBox>
        <p>
          კეთილი იყოს თქვენი მობრძანება ვებ-გვერდზე <strong>Evote.ge</strong> (შემდგომში — „პლატფორმა“, „ჩვენ“). გთხოვთ, ყურადღებით გაეცნოთ წინამდებარე წესებსა და პირობებს პლატფორმით სარგებლობამდე.
        </p>
        <p>
          პლატფორმაზე რეგისტრაციით, ავტორიზაციით ან მისი ნებისმიერი ფორმით გამოყენებით, თქვენ ადასტურებთ, რომ სრულად ეთანხმებით მოცემულ პირობებს.
        </p>
      </IntroBox>

      <Section>
        <SectionTitle>1. ზოგადი დებულებები და პლატფორმის მიზანი</SectionTitle>
        <Paragraph>
          <strong>1.1.</strong> Evote.ge წარმოადგენს ონლაინ გამოკითხვებისა და საზოგადოებრივი აზრის კვლევის დამოუკიდებელ პლატფორმას.
        </Paragraph>
        <Paragraph>
          <strong>1.2.</strong> პლატფორმაზე განთავსებული გამოკითხვები და მათი შედეგები ატარებს საინფორმაციო-სტატისტიკურ ხასიათს და არ წარმოადგენს სახელმწიფოებრივი ან ოფიციალური იურიდიული ძალის მქონე რეფერენდუმს/არჩევნებს.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>2. მომხმარებლის როლები და წვდომის დონეები</SectionTitle>
        <Paragraph>
          <strong>2.1. სტუმარი (არაავტორიზებული პირი):</strong> უფლება აქვს გაეცნოს მხოლოდ აქტიური გამოკითხვების სიას. სტუმარს არ აქვს ხმის მიცემის, შედეგების დინამიკის ნახვის ან დეტალურ სტატისტიკაზე წვდომის უფლება.
        </Paragraph>
        <Paragraph>
          <strong>2.2. ავტორიზებული მომხმარებელი:</strong> სარგებლობს სრული ფუნქციონალით — ხმის მიცემა, გამოკითხვების თვალყურის დევნება („Watch“ სია), შედეგების რეალურ დროში ნახვა და პერსონალური პროფილის მართვა.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>3. რეგისტრაცია, ანგარიშის უსაფრთხოება და იდენტიფიკაცია</SectionTitle>
        <Paragraph>
          <strong>3.1.</strong> რეგისტრაცია შესაძლებელია როგორც ელ-ფოსტითა და პაროლით, ასევე მესამე მხარის სერვისებით (OAuth — Google, Facebook).
        </Paragraph>
        <Paragraph>
          <strong>3.2.</strong> მომხმარებელი ვალდებულია რეგისტრაციისას მიუთითოს რეალური და უტყუარი მონაცემები (მათ შორის: რეგიონი, ქალაქი, ასაკი/დაბადების თარიღი, სქესი), რაც აუცილებელია დემოგრაფიული და გეოგრაფიული შეზღუდვების მქონე გამოკითხვებში მონაწილეობისთვის.
        </Paragraph>
        <Paragraph>
          <strong>3.3.</strong> თითოეულ ფიზიკურ პირს უფლება აქვს ჰქონდეს მხოლოდ ერთი აქტიური ანგარიში.
        </Paragraph>
        <Paragraph>
          <strong>3.4.</strong> მომხმარებელი თავად არის პასუხისმგებელი საკუთარი პაროლისა და ანგარიშის უსაფრთხოებაზე.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>4. ხმის მიცემის წესები და შეზღუდვები</SectionTitle>
        <Paragraph>
          <strong>4.1. ერთი ხმის პრინციპი:</strong> ერთ მომხმარებელს უფლება აქვს ერთ გამოკითხვაში დააფიქსიროს მხოლოდ ერთი ხმა.
        </Paragraph>
        <Paragraph>
          <strong>4.2. შეუქცევადობა:</strong> ხმის მიცემა არის საბოლოო და შეუქცევადი. დაფიქსირებული არჩევანის შეცვლა, რედაქტირება ან წაშლა შეუძლებელია.
        </Paragraph>
        <Paragraph>
          <strong>4.3. მანიპულაციის აკრძალვა:</strong> მკაცრად იკრძალება ავტომატიზებული სკრიპტების (Bots), პროქსი/VPN ქსელების ან სხვა ტექნიკური მანიპულაციების გამოყენება სისტემაზე ზემოქმედების ან ხმების ხელოვნურად გაზრდის მიზნით.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>5. მონაცემთა შეგროვება და უსაფრთხოების მეტამონაცემები</SectionTitle>
        <Paragraph>
          <strong>5.1.</strong> ხმის მიცემის სანდოობისა და უნიკალურობის უზრუნველსაყოფად, პლატფორმა ხმის დაფიქსირებისას ავტომატურად აღრიცხავს შემდეგ ტექნიკურ მეტამონაცემებს:
        </Paragraph>
        <List>
          <ListItem>IP მისამართი;</ListItem>
          <ListItem>მოწყობილობის ტიპი (Mobile, Desktop, Tablet);</ListItem>
          <ListItem>ოპერაციული სისტემა (OS) და ინტერნეტ ბრაუზერი;</ListItem>
          <ListItem>ხმის დაფიქსირების ზუსტი დრო.</ListItem>
        </List>
        <Paragraph>
          <strong>5.2.</strong> ეს მონაცემები გამოიყენება მხოლოდ სისტემის უსაფრთხოების, ანტი-ფროდ (Anti-Fraud) კონტროლისა და აგრეგირებული სტატისტიკის წარმოებისთვის.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>6. ანგარიშის შეჩერება და გაუქმება (Soft Delete)</SectionTitle>
        <Paragraph>
          <strong>6.1.</strong> ადმინისტრაცია იტოვებს უფლებას, გააფრთხილოს, დროებით შეუჩეროს წვდომა ან დაბლოკოს მომხმარებელი, რომელიც არღვევს წინამდებარე წესებს ან ცდილობს სისტემის მუშაობის შეფერხებას.
        </Paragraph>
        <Paragraph>
          <strong>6.2.</strong> მომხმარებელს ნებისმიერ დროს შეუძლია საკუთარი ანგარიშის დეაქტივაცია (Soft Delete). დეაქტივაციის შემდეგ ანგარიში ხდება არააქტიური, თუმცა მანამდე დაფიქსირებული ხმები სტატისტიკური უწყვეტობის მიზნით რჩება საერთო ანონიმურ ბაზაში.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>7. რეკლამა და მესამე მხარის სერვისები</SectionTitle>
        <Paragraph>
          <strong>7.1.</strong> პლატფორმა მონეტიზაციისთვის იყენებს Google AdSense-სა და მესამე მხარის სარეკლამო ქსელებს.
        </Paragraph>
        <Paragraph>
          <strong>7.2.</strong> მომხმარებლის ეკრანზე რეკლამების ჩვენება და შესაბამისი სკრიპტების ჩატვირთვა რეგულირდება საერთაშორისო სტანდარტებით (მათ შორის GDPR თანხმობის მექანიზმით).
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>8. პასუხისმგებლობის შეზღუდვა</SectionTitle>
        <Paragraph>
          <strong>8.1.</strong> პლატფორმის ადმინისტრაცია არ აგებს პასუხს მომხმარებლის მიერ მიღებულ გადაწყვეტილებებზე, რომლებიც ეფუძნება Evote.ge-ზე გამოქვეყნებულ საზოგადოებრივ შედეგებს ან გამოკითხვებს.
        </Paragraph>
        <Paragraph>
          <strong>8.2.</strong> ადმინისტრაცია არ იძლევა გარანტიას, რომ სერვისი იმუშავებს შეუფერხებლად ფორს-მაჟორული სიტუაციების, პროვაიდერის შეფერხებების ან გეგმიური ტექნიკური სამუშაოების დროს.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>9. ცვლილებები პირობებში</SectionTitle>
        <Paragraph>
          Evote.ge იტოვებს უფლებას, დროდადრო განაახლოს წინამდებარე დოკუმენტი. ცვლილებების შესახებ მომხმარებლები ინფორმირებულნი იქნებიან საიტის შიდა შეტყობინებების სისტემით ან ვებ-გვერდზე შესაბამისი ინფორმაციის განთავსებით.
        </Paragraph>
      </Section>

      <Footer>
        &copy; 2026 Evote.ge - ყველა უფლება დაცულია.
      </Footer>
    </Container>
  );
};

export default TermsAndConditions;
