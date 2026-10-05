# generate_nimbus_data.py  ->  crm_contacts.csv, app_users.csv, billing_accounts.csv
import csv, random, datetime as dt
random.seed(42)
FIRST = ["Amara","Ben","Chloe","Dev","Ella","Femi","Grace","Hari","Isla","Jack",
         "Kiran","Leah","Mo","Nina","Omar","Priya","Rhys","Sana","Tom","Zara"]
LAST  = ["Patel","Smith","Okafor","Jones","Khan","Taylor","Evans","Ahmed","Brown","Wilson"]
COMP  = ["Swift Haulage","Thames Couriers","Essex Freight","Northline Logistics",
         "Bluebird Vans","Harbour Movers"]
NICK  = {"Ben":"Benjamin","Tom":"Thomas","Mo":"Mohammed","Jack":"Jackson"}
now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

people = []
for i in range(300):
    f, l, c = random.choice(FIRST), random.choice(LAST), random.choice(COMP)
    dom = c.split()[0].lower() + ".co.uk"
    people.append(dict(f=f, l=l, c=c, email=f"{f}.{l}{i}@{dom}".lower(),
                       phone=f"+4477{random.randint(10000000, 99999999)}"))

def dirty(e):  # realistic mess: case + whitespace
    return random.choice([e, e.upper(), " " + e + " ", e.title()])

with open("crm_contacts.csv", "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["Account Name", "First Name", "Last Name", "Email", "Phone"])
    for p in people[:200]:
        w.writerow([p["c"], p["f"], p["l"], p["email"], p["phone"]])

with open("app_users.csv", "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["app_user_id","first_name","last_name","email","phone","company","created_at","last_login"])
    for i, p in enumerate(people[100:300]):
        first = NICK.get(p["f"], p["f"]) if random.random() < 0.3 else p["f"]
        w.writerow([f"APP-{10000+i}", first, p["l"], dirty(p["email"]), p["phone"],
                    p["c"], "2025-11-01T09:00:00Z", now])

with open("billing_accounts.csv", "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["billing_account_id","contact_first","contact_last","billing_email",
                "company","plan","mrr","updated_at"])
    for i, p in enumerate(people[150:250]):
        w.writerow([f"BILL-{5000+i}", p["f"], p["l"], dirty(p["email"]), p["c"],
                    random.choice(["Core","Pro"]), random.choice([180, 360, 900, 1800]), now])
print("Done. APP-10000 .. APP-10099 overlap with CRM; use APP-10060 as your test user.")
