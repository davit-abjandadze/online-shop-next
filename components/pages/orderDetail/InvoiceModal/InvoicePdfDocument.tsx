import React from "react";
import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { Order } from "@/API_Client/types";

// public/fonts/-ში დაკოპირებული HelveticaNeueLTGEO (@font-face-ის იგივე
// ფაილები, იხ. styles/globals.css) — ქართული გლიფებისა და ₾-ის (U+20BE)
// გარეშე @react-pdf/renderer-ის default ფონტი (Helvetica) ქართულს საერთოდ
// ვერ დახატავდა. განზრახ .woff (არა .woff2) — fontkit 2.0.2-ის WOFF2
// transformed-glyf რეკონსტრუქცია ამ კონკრეტულ ფონტზე დაზიანებულ glyph
// outline-ებს (ცარიელი path/აბსურდული bbox) აწარმოებდა subsetting-ის დროს,
// რის გამოც ჩამოტვირთულ PDF-ში ტექსტი უხილავი გამოდიოდა — უბრალო
// (untransformed) .woff ამ ბაგს გვერდს უვლის.
Font.register({
  family: "HelveticaGeo",
  fonts: [
    { src: "/fonts/HelveticaNeueLTGEO-55Roman.woff", fontWeight: "normal" },
    { src: "/fonts/HelveticaNeueLTGEO-75Bold.woff", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "HelveticaGeo",
    fontSize: 10,
    color: "#111111",
  },
  heading: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#555555",
    marginBottom: 18,
  },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  partyBlock: {
    width: "48%",
  },
  partyTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#777777",
    marginBottom: 4,
  },
  partyLine: {
    marginBottom: 2,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingVertical: 6,
  },
  headerCellText: {
    fontSize: 8,
    color: "#777777",
  },
  colProduct: { width: "40%" },
  colQty: { width: "20%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colSubtotal: { width: "20%", textAlign: "right" },
  itemVariant: {
    fontSize: 8,
    color: "#777777",
    marginTop: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    marginRight: 10,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
  },
});

interface IndividualFields {
  fullName: string;
  personalNumber: string;
  address: string;
}

interface LegalFields {
  companyName: string;
  taxId: string;
  legalAddress: string;
  contactPerson: string;
}

interface InvoicePdfDocumentProps {
  order: Order;
  recipientType: "individual" | "legal";
  individual: IndividualFields;
  legal: LegalFields;
  invoiceDate: string;
  sellerName: string;
  labels: {
    documentTitle: string;
    docNumber: string;
    docDate: string;
    sellerTitle: string;
    buyerTitle: string;
    tableProduct: string;
    tableQuantity: string;
    tableUnitPrice: string;
    tableSubtotal: string;
    totalLabel: string;
  };
}

export const InvoicePdfDocument: React.FC<InvoicePdfDocumentProps> = ({
  order,
  recipientType,
  individual,
  legal,
  invoiceDate,
  sellerName,
  labels,
}) => {
  const items = order.items || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>{labels.documentTitle}</Text>
        <View style={styles.metaRow}>
          <Text>{labels.docNumber}</Text>
          <Text>
            {labels.docDate}: {invoiceDate}
          </Text>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyTitle}>{labels.sellerTitle}</Text>
            <Text style={styles.partyLine}>{sellerName}</Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyTitle}>{labels.buyerTitle}</Text>
            {recipientType === "individual" ? (
              <>
                <Text style={styles.partyLine}>{individual.fullName}</Text>
                <Text style={styles.partyLine}>{individual.personalNumber}</Text>
                <Text style={styles.partyLine}>{individual.address}</Text>
              </>
            ) : (
              <>
                <Text style={styles.partyLine}>{legal.companyName}</Text>
                <Text style={styles.partyLine}>{legal.taxId}</Text>
                <Text style={styles.partyLine}>{legal.legalAddress}</Text>
                {!!legal.contactPerson && <Text style={styles.partyLine}>{legal.contactPerson}</Text>}
              </>
            )}
          </View>
        </View>

        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colProduct, styles.headerCellText]}>{labels.tableProduct}</Text>
            <Text style={[styles.colQty, styles.headerCellText]}>{labels.tableQuantity}</Text>
            <Text style={[styles.colPrice, styles.headerCellText]}>{labels.tableUnitPrice}</Text>
            <Text style={[styles.colSubtotal, styles.headerCellText]}>{labels.tableSubtotal}</Text>
          </View>
          {items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.colProduct}>
                <Text>{item.productName}</Text>
                {(item.colorName || item.sizeName) && (
                  <Text style={styles.itemVariant}>
                    {[item.colorName, item.sizeName].filter(Boolean).join(" / ")}
                  </Text>
                )}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{Number(item.unitPrice).toFixed(2)} ₾</Text>
              <Text style={styles.colSubtotal}>{(Number(item.unitPrice) * item.quantity).toFixed(2)} ₾</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{labels.totalLabel}</Text>
          <Text style={styles.totalValue}>{Number(order.totalAmount).toFixed(2)} ₾</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePdfDocument;
