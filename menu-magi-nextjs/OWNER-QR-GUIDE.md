# 🍽️ Quick Start Guide - QR Code for Restaurant Owners

## What You Get

✅ **ONE permanent QR code** for your entire restaurant  
✅ Print it **once** and use it **forever**  
✅ Place the **same QR code on every table**  
✅ QR code **never changes** when you update your menu  

---

## How to Set Up (5 Minutes)

### Step 1: Login to Dashboard
```
1. Go to: http://localhost:3000/owner/login
2. Enter your email and password
3. You're now in your dashboard
```

### Step 2: Generate Your QR Code
```
1. Click the "QR Code" button in the top right
2. Your unique QR code appears
3. This is YOUR restaurant's permanent QR code
```

### Step 3: Print the QR Code
```
1. Click "Print QR Code" button
2. Print multiple copies (one per table recommended)
3. Or save as PDF for later printing
```

### Step 4: Place QR Codes on Tables
```
1. Print and laminate for durability
2. Place one copy on EVERY table
3. Can use table tents, stickers, or frames
```

### Step 5: You're Done! 🎉
```
Customers can now:
1. Scan QR code from any table
2. Select their table number
3. Browse YOUR menu
4. Place orders
```

---

## What Happens When Customer Scans

```
┌──────────────────────┐
│  Customer at Table 5 │
│   Scans QR Code      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Phone opens:        │
│  Table Selection     │
│  "Select Your Table" │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Customer clicks     │
│  "Table 5"           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Shows YOUR menu     │
│  (your items only)   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Customer orders     │
│  You receive order   │
│  with "Table 5"      │
└──────────────────────┘
```

---

## Important: Same QR Code for All Tables

❌ **WRONG WAY:**
- Different QR code for each table
- Need to regenerate when menu changes
- Complex to manage

✅ **RIGHT WAY (Your System):**
- ONE QR code for entire restaurant
- Place same QR code on all tables
- Customer selects table number after scanning
- Never needs regeneration

---

## FAQ

### Q: Do I need different QR codes for different tables?
**A:** No! Use the **same QR code** on all tables. Customers select their table number after scanning.

### Q: What if I add or remove menu items?
**A:** QR code **stays the same**. Menu changes are automatic. No need to reprint.

### Q: What if I change restaurant name?
**A:** QR code **stays the same**. Only the display name changes.

### Q: Can I print it on paper?
**A:** Yes, but **lamination recommended** for durability. Will be handled frequently by customers.

### Q: How big should I print it?
**A:** Minimum **5cm x 5cm** (2" x 2"). Larger is easier to scan (recommended 8cm x 8cm).

### Q: Where should I place it?
**A:** Common locations:
- Table tent (standing card on table)
- Sticker on table surface
- Small frame on table
- Menu cover
- Wall-mounted near tables

### Q: What if customer scans wrong restaurant's QR code?
**A:** Impossible! Each QR code is unique to your restaurant. They'll only see YOUR menu.

---

## Your QR Code Contains:

```
http://localhost:3000/customer/table?restaurant=YOUR-UNIQUE-ID
                                                  └─────┬──────┘
                                                        │
                                    This is permanent and never changes
```

**Example QR Code URL:**
```
http://localhost:3000/customer/table?restaurant=550e8400-e29b-41d4-a716-446655440000
```

- `YOUR-UNIQUE-ID` = Your restaurant's permanent database ID
- Generated when you created your account
- Never changes
- Links to your menu items only

---

## Testing Your QR Code

### Test 1: Scan from Phone
```
1. Open camera app on your phone
2. Point at QR code on screen
3. Tap the notification that appears
4. Should see table selection page
5. Select a table
6. Should see YOUR menu items
```

### Test 2: Manual URL Test
```
1. Click "Copy URL" button in dashboard
2. Paste URL in phone browser
3. Should go to table selection
4. Select table and view menu
```

---

## Print-Ready Checklist

Before printing your QR codes:

- [ ] QR code displays correctly on dashboard
- [ ] Tested scanning with phone - works ✓
- [ ] Decided placement (table tent / sticker / frame)
- [ ] Planned quantity (1 per table minimum)
- [ ] Ready to laminate for protection
- [ ] Have plan for table number signs (so customers know which table they're at)

---

## Pro Tips

💡 **Add Instructions**
Print small text below QR code:
```
"Scan to view menu and order
Select your table number after scanning"
```

💡 **Table Numbers**
Make sure tables are clearly numbered (1-20) so customers know which to select.

💡 **WiFi Available**
Consider offering free WiFi so customers can scan even without mobile data.

💡 **Backup Option**
Also display the URL in text (http://yoursite.com/customer/table?restaurant=xxx) for customers who can't scan.

💡 **Test Regularly**
Scan your QR code weekly to ensure it's working properly.

---

## Need Help?

**QR Code not generating?**
- Refresh the dashboard
- Click QR Code button again
- Logout and login

**QR Code not scanning?**
- Ensure good lighting
- Print larger (8cm x 8cm recommended)
- Check phone camera is working
- Try different QR code reader app

**Wrong menu showing?**
- Each QR code is unique to your restaurant
- Customers will only see YOUR items
- If issue persists, contact support

---

## Summary

🎯 **Your QR code system is:**
- **Permanent** - Print once, use forever
- **Simple** - Same code for all tables
- **Secure** - Only your menu shows
- **Automatic** - Menu updates instantly
- **Professional** - Industry standard approach

**You're all set! 🚀**

Just print your QR code, place it on tables, and start receiving orders!
