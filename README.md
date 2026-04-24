# Sistem de monitorizare alarme

## Descriere proiect
Acest proiect are ca obiectiv dezvoltarea unui sistem complet pentru **monitorizarea, analiza și corelarea alertelor (alarme)** generate de infrastructură și aplicații.

Aplicația simulează un sistem real utilizat în:
- NOC (Network Operations Center)
- sisteme de monitoring precum Zabbix, Prometheus sau Splunk

---

## Tehnologii utilizate

- **Frontend:** React.js  
- **Backend:** Python (REST API)  
- **Baza de date:** Microsoft SQL Server  
- **AI Chatbot:** GPT-4o mini  

---

##  Funcționalități principale

Aplicația este structurată în 3 componente majore:

---

## 1. Tabel de alarme (UI principal)

### Descriere
Un tabel interactiv care afișează alarmele din baza de date, similar unui dashboard real folosit de echipe DevOps / SRE.

### Coloane afișate
- ALARM_NUMBER  
- STATUS  
- SEVERITY  
- SERVER_NAME  
- SUMMARY  
- TYPE  
- ALERT_GROUP  
- FIRST_OCCURENCE_DATETIME  

### Funcționalități

#### Filtrare după:
- status (Active, Cleared, Closed)  
- severity (Critical, Major, Minor etc.)  
- type (System, Application, Network)  
- alert_group  
- server_name  
- project  
- interval de timp  

#### Căutare:
- după text (SUMMARY, ALERT_DESCRIPTION, SERVER_NAME)

#### Alte funcționalități:
- paginare (10 / 25 / 50 rânduri)  
- sortare (după dată, severitate, server)

## 2. Grafice KPI (Key Performance Indicators)

Vizualizarea și analiza performanței sistemului pe baza alertelor.

### KPI-uri implementate

#### KPI de volum
- Număr total de alarme  
- Număr de alarme active  
- Distribuție pe severitate  

#### KPI de timp
- Timp mediu de rezolvare a alarmelor

#### KPI de severitate
- Procent alarme Critical  
- Top servere cu cele mai multe alarme  

####  KPI de categorii
- Distribuție pe:
- CATEGORY_TIER_1  
- CATEGORY_TIER_2  
- CATEGORY_TIER_3  

## 3. Intelligent AI-Based Data Assistant

### Scop
Permite utilizatorului să interogheze baza de date folosind **limbaj natural**.

---

### Exemple de întrebări
- Câte alarme sunt active?  
- Care este cel mai afectat server?  
- Care sunt cele mai frecvente alarme?  
- Câte alarme Critical avem azi?  
- Care este timpul mediu de rezolvare?  
- Ce tip de alarme apare cel mai des?  
- Ce alarme se repetă cel mai mult?  
- Care sunt alarmele nerezolvate?  

---

### Cum funcționează

1. Userul introduce o întrebare  
2. AI-ul:
 - interpretează întrebarea  
 - generează query SQL  
3. Backend-ul:
 - execută query-ul  
 - returnează rezultatul  
4. AI-ul:
 - oferă răspuns în limbaj natural  
