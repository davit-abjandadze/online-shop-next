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

export const PrivacyPolicy = () => {
  return (
    <>
      <Header />
      <Container>
        <PageHeader>
          <Title>პერსონალურ მონაცემთა დაცვის პოლიტიკა</Title>
          <MetaInfo>
            <MetaItem>
              <strong>პლატფორმა:</strong> ონლაინ მაღაზია
            </MetaItem>
            <MetaItem>
              <strong>ბოლო განახლების თარიღი:</strong> 18 სექტემბერი, 2026 წელი
            </MetaItem>
          </MetaInfo>
        </PageHeader>

        <IntroBox>
          <p>
            წინამდებარე დოკუმენტი განსაზღვრავს, თუ როგორ აგროვებს, ამუშავებს და იცავს შპს „Geomotors“ (საიდენტიფიკაციო კოდი: 00000000000; შემდგომში — „კომპანია“, „პლატფორმა“, „ჩვენ“) მომხმარებელთა პერსონალურ მონაცემებს, საქართველოს კანონმდებლობის — „პერსონალურ მონაცემთა დაცვის შესახებ“ საქართველოს კანონის — შესაბამისად.
          </p>
          <p>
            პლატფორმით სარგებლობით (რეგისტრაცია, ავტორიზაცია, შეკვეთის გაფორმება) თქვენ ეთანხმებით წინამდებარე პოლიტიკით გათვალისწინებულ პირობებს.
          </p>
        </IntroBox>

        <Section>
          <SectionTitle>1. ზოგადი დებულებები და დამუშავებისთვის პასუხისმგებელი პირი</SectionTitle>
          <Paragraph>
            <strong>1.1.</strong> პერსონალურ მონაცემთა დამუშავებისთვის პასუხისმგებელი პირია შპს „Geomotors“ (ს/კ 00000000000).
          </Paragraph>
          <Paragraph>
            <strong>1.2.</strong> პლატფორმა ამუშავებს პერსონალურ მონაცემებს კანონიერების, სამართლიანობისა და გამჭვირვალობის პრინციპების დაცვით, მხოლოდ კონკრეტული და ლეგიტიმური მიზნებისთვის.
          </Paragraph>
          <Paragraph>
            <strong>1.3.</strong> მონაცემთა დამუშავება ხორციელდება მინიმალურობის პრინციპით — ვამუშავებთ მხოლოდ იმ მოცულობის მონაცემებს, რაც აუცილებელია კონკრეტული მიზნის მისაღწევად.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>2. რა მონაცემებს ვაგროვებთ</SectionTitle>
          <List>
            <ListItem>
              <strong>საიდენტიფიკაციო მონაცემები:</strong> სახელი, გვარი, ელ-ფოსტის მისამართი, ტელეფონის ნომერი.
            </ListItem>
            <ListItem>
              <strong>ავტორიზაციის მონაცემები:</strong> პაროლი (დაშიფრული სახით), ან მესამე მხარის (Google, Facebook) ანგარიშის საიდენტიფიკაციო მონაცემები OAuth-ავტორიზაციისას.
            </ListItem>
            <ListItem>
              <strong>შეკვეთასთან დაკავშირებული მონაცემები:</strong> მიწოდების მისამართი, არჩეული ფილიალი, შეკვეთების ისტორია, გადახდის დეტალები (მუშავდება უსაფრთხო, დაშიფრული არხებით).
            </ListItem>
            <ListItem>
              <strong>ტექნიკური მონაცემები:</strong> IP-მისამართი, მოწყობილობისა და ბრაუზერის ინფორმაცია, cookies და მსგავსი ტექნოლოგიები საიტის ფუნქციონირებისა და ანალიტიკისთვის.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>3. დამუშავების სამართლებრივი საფუძვლები</SectionTitle>
          <Paragraph>
            მონაცემთა დამუშავება ხორციელდება შემდეგი საფუძვლებით: მომხმარებლის თანხმობა; შეკვეთის/ხელშეკრულების შესრულების აუცილებლობა; კანონმდებლობით დაკისრებული ვალდებულებების შესრულება; და პლატფორმის ლეგიტიმური ინტერესი (მაგ., სისტემის უსაფრთხოება, თაღლითობის პრევენცია).
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>4. მონაცემთა დამუშავების მიზნები</SectionTitle>
          <List>
            <ListItem>ანგარიშის შექმნა, ავტორიზაცია და მომხმარებლის იდენტიფიკაცია;</ListItem>
            <ListItem>შეკვეთის მიღება, დამუშავება, მიწოდება და დაბრუნების პროცესის უზრუნველყოფა;</ListItem>
            <ListItem>მომხმარებელთან კომუნიკაცია შეკვეთის სტატუსთან და მომსახურებასთან დაკავშირებით;</ListItem>
            <ListItem>საიტის ფუნქციონირების გაუმჯობესება და ანალიტიკა;</ListItem>
            <ListItem>
              პირდაპირი მარკეტინგი — მხოლოდ მომხმარებლის თანხმობის საფუძველზე, ნებისმიერ დროს გაუქმების უფლებით.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>5. მონაცემთა გაზიარება მესამე პირებთან</SectionTitle>
          <Paragraph>
            <strong>5.1.</strong> პერსონალურ მონაცემებს ვუზიარებთ მხოლოდ იმ მესამე პირებს, რომელთა ჩართულობაც აუცილებელია მომსახურების გასაწევად — მიწოდების სამსახურები, გადახდის პროვაიდერები, ტექნიკური მომსახურების პარტნიორები.
          </Paragraph>
          <Paragraph>
            <strong>5.2.</strong> პლატფორმა შეიძლება იყენებდეს ანალიტიკურ და სარეკლამო სერვისებს (მათ შორის Google-ის სერვისები), რომლებიც შესაძლოა თავად ამუშავებდნენ ტექნიკურ მონაცემებს საკუთარი პოლიტიკის შესაბამისად.
          </Paragraph>
          <Paragraph>
            <strong>5.3.</strong> მონაცემები არ გადაეცემა მესამე პირებს კომერციული მიზნებით მომხმარებლის დამატებითი თანხმობის გარეშე.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>6. Cookies (ქუქი ფაილები)</SectionTitle>
          <Paragraph>
            პლატფორმა იყენებს ქუქი ფაილებს საიტის სწორად ფუნქციონირებისთვის (მაგ., ავტორიზაციის სესია, ენის არჩევანი) და ანალიტიკური მიზნებისთვის. მომხმარებელს შეუძლია ბრაუზერის პარამეტრებში ნებისმიერ დროს გამორთოს ან წაშალოს ქუქი ფაილები, თუმცა ამან შესაძლოა შეზღუდოს საიტის ზოგიერთი ფუნქციის მუშაობა.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>7. მონაცემთა შენახვის ვადა</SectionTitle>
          <Paragraph>
            პერსონალური მონაცემები ინახება მხოლოდ იმ ვადით, რაც აუცილებელია მათი შეგროვების მიზნის მისაღწევად, ან კანონმდებლობით დადგენილი ვადით (მაგ., საბუღალტრო/საგადასახადო აღრიცხვის მოთხოვნები). ანგარიშის დეაქტივაციის (Soft Delete) შემთხვევაში, უკვე გაფორმებული შეკვეთების ისტორია რჩება სისტემაში აღრიცხვის მიზნით.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>8. მონაცემთა უსაფრთხოება</SectionTitle>
          <Paragraph>
            <strong>8.1.</strong> პლატფორმა იყენებს შესაბამის ტექნიკურ და ორგანიზაციულ ზომებს (მონაცემთა დაშიფვრა, წვდომის კონტროლი, უსაფრთხო კავშირი) პერსონალური მონაცემების შემთხვევითი დაკარგვის, უნებართვო წვდომის ან გამჟღავნებისგან დასაცავად.
          </Paragraph>
          <Paragraph>
            <strong>8.2. ინციდენტის შესახებ შეტყობინება:</strong> უსაფრთხოების ინციდენტის (მონაცემთა გაჟონვის) აღმოჩენის შემთხვევაში, თუ სავარაუდოა, რომ მან შეიძლება მნიშვნელოვანი ზიანი მიაყენოს ან საფრთხე შეუქმნას მომხმარებელთა უფლებებსა და თავისუფლებებს, კომპანია ვალდებულია აღრიცხოს ინციდენტი და არაუგვიანეს 72 საათისა შეატყობინოს საქართველოს პერსონალურ მონაცემთა დაცვის სამსახურს კანონმდებლობით დადგენილი წესით.
          </Paragraph>
          <Paragraph>
            <strong>8.3.</strong> თუ ინციდენტმა მაღალი ალბათობით შეიძლება მნიშვნელოვანი ზიანი მიაყენოს მომხმარებელს, კომპანია დაუყოვნებლივ, გაუმართლებელი დაყოვნების გარეშე აცნობებს ამის შესახებ შესაბამის მომხმარებელს და მიაწვდის ინფორმაციას ინციდენტის ხასიათისა და მიღებული ზომების შესახებ.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>9. მონაცემთა სუბიექტის უფლებები</SectionTitle>
          <Paragraph>
            საქართველოს კანონმდებლობის შესაბამისად, მომხმარებელს უფლება აქვს:
          </Paragraph>
          <List>
            <ListItem>მოითხოვოს ინფორმაცია საკუთარი მონაცემების დამუშავების შესახებ და მიიღოს მათი ასლი;</ListItem>
            <ListItem>მოითხოვოს არასწორი ან არასრული მონაცემების გასწორება/განახლება;</ListItem>
            <ListItem>მოითხოვოს მონაცემთა დამუშავების შეწყვეტა, დაბლოკვა ან წაშლა კანონმდებლობით გათვალისწინებულ შემთხვევებში;</ListItem>
            <ListItem>ნებისმიერ დროს გამოიხმოს თანხმობა (მაგ., მარკეტინგულ შეტყობინებებზე გამოწერა);</ListItem>
            <ListItem>მიმართოს პლატფორმას ან საქართველოს პერსონალურ მონაცემთა დაცვის სამსახურს, უფლებების დარღვევის შემთხვევაში.</ListItem>
          </List>
          <Paragraph>
            <strong>9.1. მოთხოვნაზე პასუხის ვადა:</strong> ზემოაღნიშნული მოთხოვნები განიხილება და შესაბამისი პასუხი მომხმარებელს ეცნობება არაუგვიანეს 10 სამუშაო დღისა, მოთხოვნის მიღებიდან. განსაკუთრებულ, დასაბუთებულ შემთხვევაში, ეს ვადა შესაძლოა გაგრძელდეს არაუმეტეს დამატებით 10 სამუშაო დღით, რის შესახებაც მომხმარებელი დაუყოვნებლივ იქნება ინფორმირებული.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>10. არასრულწლოვანთა მონაცემები</SectionTitle>
          <Paragraph>
            პლატფორმა შეგნებულად არ აგროვებს 16 წლამდე ასაკის პირთა პერსონალურ მონაცემებს კანონიერი წარმომადგენლის თანხმობის გარეშე. თუ დადგინდება, რომ ასეთი მონაცემი შემთხვევით არის შეგროვებული, ის დაუყოვნებლივ წაიშლება.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>11. კონტაქტი</SectionTitle>
          <Paragraph>
            პერსონალურ მონაცემთა დამუშავებასთან დაკავშირებული ნებისმიერი კითხვის, მოთხოვნის ან პრეტენზიის შემთხვევაში, მომხმარებელს შეუძლია დაგვიკავშირდეს პლატფორმაზე მითითებული საკონტაქტო არხების საშუალებით. მოთხოვნები განიხილება წინამდებარე პოლიტიკის მე-9 მუხლით დადგენილი ვადების დაცვით.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>12. ცვლილებები პოლიტიკაში</SectionTitle>
          <Paragraph>
            ადმინისტრაცია იტოვებს უფლებას, დროდადრო განაახლოს წინამდებარე პოლიტიკა. მნიშვნელოვანი ცვლილებების შესახებ მომხმარებლები ინფორმირებულნი იქნებიან საიტის შიდა შეტყობინებების სისტემით ან ვებ-გვერდზე შესაბამისი ინფორმაციის განთავსებით.
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

export default PrivacyPolicy;
