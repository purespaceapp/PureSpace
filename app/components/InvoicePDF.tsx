import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

type Props = {
  property: any;
  schedules: any[];
  extrasMap: Record<number, any[]>;
  extrasCatalog: any[];
  cleaningTotal: number;
  approvedReceipts: any[];
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 20,
    marginBottom: 25,
  },

  logoSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 55,
    height: 55,
    marginRight: 15,
  },

  company: {
    fontSize: 24,
    color: "#2E7BBE",
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 11,
  },

  invoiceBox: {
    alignItems: "flex-end",
  },

  invoiceTitle: {
    color: "#94a3b8",
    fontSize: 10,
    marginBottom: 6,
  },

  invoiceNumber: {
    fontSize: 22,
    fontWeight: "bold",
  },

  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 20,
  },

  billTo: {
    width: "50%",
  },

  infoRight: {
    width: "35%",
  },

  smallLabel: {
    color: "#94a3b8",
    fontSize: 9,
    marginBottom: 5,
  },

  owner: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  address: {
    color: "#64748b",
    lineHeight: 1.4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  rowLabel: {
    color: "#64748b",
  },

  rowValue: {
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },

  sectionSubtitle: {
    color: "#64748b",
    marginBottom: 15,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 10,
    alignItems: "flex-start",
  },

  date: {
    width: "20%",
    paddingLeft: 8,
    fontWeight: "bold",
  },

  service: {
    width: "35%",
  },

  extras: {
    width: "25%",
  },

  amount: {
    width: "20%",
    textAlign: "right",
    paddingRight: 8,
    fontWeight: "bold",
  },
});

export default function InvoicePDF({
  property,
  schedules,
  extrasMap,
  extrasCatalog,
  cleaningTotal,
  approvedReceipts,
}: Props) {

  const expensesTotal = approvedReceipts.reduce(
    (sum, receipt) => sum + Number(receipt.amount),
    0
  );

  return (

<Document>

<Page
size="A4"
style={styles.page}
>

<View style={styles.header}>

<View style={styles.logoSection}>

<Image
src="/images/logo.jpg"
style={styles.logo}
/>

<View>

<Text style={styles.company}>
PureSpace Cleaning
</Text>

<Text style={styles.subtitle}>
Property Statement
</Text>

</View>

</View>

<View style={styles.invoiceBox}>

<Text style={styles.invoiceTitle}>
INVOICE
</Text>

<Text style={styles.invoiceNumber}>
PS-{String(property.id).padStart(5,"0")}
</Text>

</View>

</View>
{/* PROPERTY INFO */}

<View style={styles.info}>

  <View style={styles.billTo}>

    <Text style={styles.smallLabel}>
      BILL TO
    </Text>

    <Text style={styles.owner}>
      {property.owner_name || "Property Owner"}
    </Text>

    <Text style={styles.address}>
      {property.address}
    </Text>

  </View>

  <View style={styles.infoRight}>

    <View style={styles.row}>

      <Text style={styles.rowLabel}>
        Property
      </Text>

      <Text style={styles.rowValue}>
        {property.name}
      </Text>

    </View>

    <View style={styles.row}>

      <Text style={styles.rowLabel}>
        Billing Period
      </Text>

      <Text style={styles.rowValue}>
        {new Date().toLocaleString("en-US",{
          month:"long",
          year:"numeric",
        })}
      </Text>

    </View>

    <View style={styles.row}>

      <Text style={styles.rowLabel}>
        Statement Date
      </Text>

      <Text style={styles.rowValue}>
        {new Date().toLocaleDateString("en-US")}
      </Text>

    </View>

  </View>

</View>

<Text style={styles.sectionTitle}>
Completed Cleanings
</Text>

<Text style={styles.sectionSubtitle}>
All completed services included in this statement.
</Text>

<View style={styles.tableHeader}>

  <Text style={styles.date}>
    Date
  </Text>

  <Text style={styles.service}>
    Service
  </Text>

  <Text style={styles.extras}>
    Extras
  </Text>

  <Text style={styles.amount}>
    Amount
  </Text>

</View>

{schedules.map((schedule)=>{

const extras =
extrasMap[schedule.id] ?? [];

const receipts =
approvedReceipts.filter(
(r)=>r.schedule_id===schedule.id
);

return(

<View
key={schedule.id}
style={{
borderBottomWidth:1,
borderBottomColor:"#f1f5f9",
paddingVertical:10,
}}
>

<View style={styles.tableRow}>

<Text style={styles.date}>
{new Date(
schedule.cleaning_date
).toLocaleDateString("en-US",{
month:"short",
day:"numeric",
year:"numeric",
})}
</Text>

<View style={styles.service}>

<Text>
Regular Cleaning
</Text>

{schedule.notes && (

<Text
style={{
marginTop:4,
fontSize:9,
color:"#64748b",
}}
>

{schedule.notes}

</Text>

)}

</View>

<Text style={styles.extras}>

{extras.length
? extras
.map((extra)=>{

const info =
extrasCatalog.find(
(e)=>e.id===extra.extra_id
);

return info?.name;

})
.filter(Boolean)
.join(", ")

: "—"}

</Text>

<Text style={styles.amount}>
${Number(
schedule.company_charge
).toFixed(2)}
</Text>

</View>
{receipts.length > 0 && (

<View
style={{
marginLeft:"20%",
marginBottom:8,
}}
>

{receipts.map((receipt)=>(

<View
key={receipt.id}
style={{
flexDirection:"row",
justifyContent:"space-between",
paddingVertical:2,
}}
>

<Text
  style={{
    fontSize: 11,
    color: "#2563eb",
    fontWeight: "bold",
  }}
>
  Property Expense
</Text>

<Text
  style={{
    fontSize: 11,
    fontWeight: "bold",
    color: "#2563eb",
  }}
>
  +${Number(receipt.amount).toFixed(2)}
</Text>

</View>

))}

</View>

)}

</View>

);

})}

<View
style={{
marginTop:30,
alignSelf:"flex-end",
width:220,
}}
>

<View
style={{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:8,
}}
>

<Text>
Cleaning Total
</Text>

<Text>
${cleaningTotal.toFixed(2)}
</Text>

</View>

<View
style={{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:8,
}}
>

<Text>
Property Expenses
</Text>

<Text>
${expensesTotal.toFixed(2)}
</Text>

</View>

<View
style={{
borderTopWidth:1,
borderTopColor:"#d1d5db",
paddingTop:10,
marginTop:6,
flexDirection:"row",
justifyContent:"space-between",
}}
>

<Text
style={{
fontSize:14,
fontWeight:"bold",
}}
>
TOTAL DUE
</Text>

<Text
style={{
fontSize:14,
fontWeight:"bold",
color:"#2E7BBE",
}}
>
${(cleaningTotal+expensesTotal).toFixed(2)}
</Text>

</View>

</View>

</Page>

</Document>

);

}