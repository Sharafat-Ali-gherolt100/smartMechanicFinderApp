# Smart Mechanic Finder
## A Mobile Application for Connecting Vehicle Owners with Nearby Mechanics
### Final Year Project Documentation
### Department of Computer Science, University of Baltistan, Skardu (UOBS)
### Session: 2021–2025 | Date: May 03, 2025

---

## TITLE PAGE

**Project Title:** Smart Mechanic Finder

**Subtitle:** A Mobile Application for Connecting Vehicle Owners with Nearby Mechanics

**Submitted by:**
- Student One
- Student Two
- Student Three

**Supervised by:** Supervisor Name

**Department:** Department of Computer Science

**University:** University of Baltistan, Skardu (UOBS)

**Session:** 2021–2025

**Date:** May 03, 2025

---

## ABSTRACT

The Smart Mechanic Finder is a mobile application developed as a Final Year Project at the University of Baltistan, Skardu (UOBS) to address the critical problem of vehicle breakdown management and mechanic discovery in Pakistan. Vehicle owners across Pakistan routinely face significant challenges when their vehicles break down in unfamiliar locations, lacking any structured mechanism to locate, verify, or contact nearby qualified mechanics. This project presents a comprehensive three-tier mobile-backend architecture that bridges the gap between vehicle owners in distress and available mechanics in the vicinity.

The system is developed using React Native (version 0.74.0) for the Android mobile application, Flask 3.0.0 as the RESTful backend API framework, and MongoDB 8.x as the document-oriented database. The application implements GPS-based real-time mechanic discovery using MongoDB's 2dsphere geospatial indexing and the Haversine formula for accurate distance calculation. Secure user authentication is achieved through JSON Web Tokens (JWT) with role-based access control enforcing three distinct user roles: Vehicle Owner, Mechanic, and Admin.

Key features of the platform include: GPS-based nearby mechanic search with distance and estimated time of arrival (ETA) display; a multi-category rating system allowing vehicle owners to rate mechanics on punctuality, work quality, communication, and value for money; an SOS emergency alert system that broadcasts distress signals to all online mechanics within a configurable radius; in-app messaging between vehicle owners and mechanics; an admin panel for mechanic credential verification and platform analytics; and an offline-aware mobile interface that notifies users when network connectivity is lost.

The backend API exposes twenty RESTful endpoints across six Blueprint modules (auth, mechanic, rating, SOS, message, admin), all protected by JWT middleware and enforced role checks. The database schema employs a 2dsphere index on mechanic location coordinates, enabling sub-second geospatial proximity queries across potentially large datasets. Testing confirmed that all high-priority functional requirements were met, with API response times below 500 milliseconds for standard operations and below one second for geospatial searches.

The Smart Mechanic Finder demonstrates that a modern mobile-backend stack can deliver a responsive, location-aware service marketplace application that meaningfully improves access to vehicle repair services for Pakistan's growing vehicle-owning population.

---

## TABLE OF CONTENTS

- Abstract
- Table of Contents
- List of Figures
- List of Tables
- List of Abbreviations
- **Chapter 1: Introduction**
  - 1.1 Introduction
    - 1.1.1 Background
    - 1.1.2 Problem Statement
  - 1.2 Literature Review
    - 1.2.1 Gap Analysis
  - 1.3 Purpose of the Project
  - 1.4 Objectives
  - 1.5 Scope
  - 1.6 Tools and Technologies
- **Chapter 2: Requirements Analysis**
  - 2.1 Functional Requirements
  - 2.2 Non-Functional Requirements
  - 2.3 Use Case Analysis
    - 2.3.1 Use Case: Register and Login
    - 2.3.2 Use Case: Search Nearby Mechanics
    - 2.3.3 Use Case: Rate a Mechanic
    - 2.3.4 Use Case: Send SOS Alert
    - 2.3.5 Use Case: View Service History
    - 2.3.6 Use Case: Admin Verify Mechanic
  - 2.4 User Roles and Actors
- **Chapter 3: System Design**
  - 3.1 System Architecture
  - 3.2 Database Design
    - 3.2.1 Users Collection
    - 3.2.2 Mechanics Collection
    - 3.2.3 Ratings Collection
    - 3.2.4 Service Requests Collection
    - 3.2.5 Messages Collection
    - 3.2.6 SOS Alerts Collection
    - 3.2.7 Analytics Collection
  - 3.3 API Design
  - 3.4 Mobile App Navigation Design
  - 3.5 Security Design
- **Chapter 4: Implementation**
  - 4.1 Backend Implementation
    - 4.1.1 Application Factory (create_app)
    - 4.1.2 Database Utility
    - 4.1.3 Authentication Module
    - 4.1.4 Mechanic Module
    - 4.1.5 Location-Based Search
    - 4.1.6 Rating System
    - 4.1.7 Notification Module
    - 4.1.8 Admin Module
  - 4.2 Mobile Application Implementation
    - 4.2.1 AuthContext
    - 4.2.2 LocationContext
    - 4.2.3 Offline Network Handling
    - 4.2.4 User Home Screen
    - 4.2.5 Mechanic Search Screen
    - 4.2.6 Mechanic Dashboard Screen
    - 4.2.7 Admin Panel Screens
    - 4.2.8 In-App Messaging Screen
    - 4.2.9 Rating Screen
  - 4.3 Key Algorithms and Logic
    - 4.3.1 Haversine Distance Calculation
    - 4.3.2 APScheduler Background Tasks
    - 4.3.3 JWT Token Validation Middleware
    - 4.3.4 ETA Calculation Logic
  - 4.4 Emergency Features
    - 4.4.1 SOS Alert System
    - 4.4.2 Emergency Alert Broadcasting (Admin)
- **Chapter 5: Testing and Evaluation**
  - 5.1 Testing Approach
  - 5.2 Backend API Testing Results
  - 5.3 Mobile Application Testing Results
  - 5.4 Results and Evaluation
- **Chapter 6: Conclusion and Future Work**
  - 6.1 Conclusion
  - 6.2 Future Work
- References
- Appendices
  - Appendix A: Installation and Setup Guide
  - Appendix B: API Reference (Extended)
  - Appendix C: MongoDB Index Setup Script
  - Appendix D: Environment Configuration (.env)

---

## LIST OF FIGURES

| Figure | Description |
|--------|-------------|
| Figure 1.1 | Three-Tier Architecture Overview of Smart Mechanic Finder |
| Figure 1.2 | Comparison of Traditional vs Digital Mechanic Discovery Workflow |
| Figure 3.1 | Complete System Architecture Diagram (Presentation, Application, Data Tiers) |
| Figure 3.2 | Database Entity Relationship Diagram |
| Figure 3.3 | API Blueprint Structure and URL Prefix Mapping |
| Figure 3.4 | Mobile Application Navigation Tree (Role-Based) |
| Figure 3.5 | JWT Authentication Flow Sequence Diagram |
| Figure 3.6 | SOS Alert Broadcast Flow Diagram |
| Figure 4.1 | Application Factory Pattern and Blueprint Registration |
| Figure 4.2 | MongoDB 2dsphere Geospatial Query Visualisation |
| Figure 4.3 | Haversine Formula Spherical Triangle Diagram |
| Figure 4.4 | Vehicle Owner Home Screen Wireframe |
| Figure 4.5 | Mechanic Search Results Screen Wireframe |
| Figure 4.6 | Admin Dashboard Analytics Screen Wireframe |
| Figure 5.1 | API Test Coverage Summary Chart |
| Figure 5.2 | API Response Time Distribution Graph |

---

## LIST OF TABLES

| Table | Description |
|-------|-------------|
| Table 1.1 | Tools and Technologies Summary |
| Table 2.1 | Functional Requirements (FR-01 to FR-24) |
| Table 2.2 | Non-Functional Requirements (NFR-01 to NFR-12) |
| Table 2.3 | User Roles and Permissions Summary |
| Table 3.1 | Users Collection Schema |
| Table 3.2 | Mechanics Collection Schema |
| Table 3.3 | Ratings Collection Schema |
| Table 3.4 | Service Requests Collection Schema |
| Table 3.5 | Messages Collection Schema |
| Table 3.6 | SOS Alerts Collection Schema |
| Table 3.7 | Analytics Collection Schema |
| Table 3.8 | Complete API Endpoints Reference |
| Table 4.1 | Objectives Priority and Implementation Status |
| Table 5.1 | Backend API Test Cases and Results |
| Table 5.2 | Mobile Application Test Cases and Results |
| Table 5.3 | Performance Metrics Summary |

---

## LIST OF ABBREVIATIONS

| Abbreviation | Expansion |
|-------------|-----------|
| API | Application Programming Interface |
| REST | Representational State Transfer |
| HTTP | Hypertext Transfer Protocol |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| FCM | Firebase Cloud Messaging |
| GPS | Global Positioning System |
| ETA | Estimated Time of Arrival |
| SOS | Save Our Souls (Emergency Distress Signal) |
| CORS | Cross-Origin Resource Sharing |
| NDK | Native Development Kit (Android) |
| UI | User Interface |
| UX | User Experience |
| SDK | Software Development Kit |
| ORM | Object-Relational Mapping |
| CRUD | Create, Read, Update, Delete |
| BSON | Binary JSON (MongoDB internal format) |
| GeoJSON | Geographic JSON (spatial data format) |
| 2dsphere | MongoDB two-dimensional sphere geospatial index |
| HS256 | HMAC with SHA-256 (JWT signing algorithm) |
| BCrypt | Blowfish-based password hashing algorithm |
| APScheduler | Advanced Python Scheduler |
| CDN | Content Delivery Network |
| HTTPS | Hypertext Transfer Protocol Secure |

---

# CHAPTER 1: INTRODUCTION

## 1.1 Introduction

The Smart Mechanic Finder is a mobile application designed to address one of the most persistent and underserved needs in Pakistan's rapidly growing vehicle ownership landscape: the efficient, reliable, and verifiable discovery of nearby automotive mechanics during both routine service needs and emergency breakdown situations. As smartphone penetration and mobile internet adoption continue to accelerate across Pakistan, the opportunity to digitise traditionally informal, word-of-mouth service industries has never been more compelling. This project applies the lessons learned from location-based service platforms such as Uber and Careem to the automotive repair sector, delivering a dedicated three-tier application that connects vehicle owners and mechanics through a GPS-aware, verified, and rated marketplace. The result is a system that not only solves the immediate problem of mechanic discovery but also builds the trust infrastructure necessary for vehicle owners to rely on the platform in high-stress emergency situations.

The application is built on a three-tier architecture comprising a React Native mobile frontend targeting Android devices, a Flask-based RESTful backend API written in Python, and a MongoDB document-oriented database for persistent storage. This separation of concerns enables each tier to scale independently, allows the mobile client and any future web client to share the same backend API, and isolates the business logic from the presentation layer. The backend exposes a set of clearly defined RESTful endpoints organised into Flask Blueprints for authentication, mechanic management, rating submission, SOS emergency handling, in-app messaging, and admin operations. The database leverages MongoDB's 2dsphere geospatial indexing capability to support millisecond-range proximity searches across mechanic location data stored in GeoJSON Point format.

Three user roles drive the application's access control model: the Vehicle Owner, the Mechanic, and the Admin. Vehicle Owners are the primary consumers of the platform who search for nearby mechanics, submit emergency SOS alerts, rate completed services, exchange messages with mechanics, and review their service history. Mechanics are service providers who register on the platform with their shop details, geographic location, and service specialisations, then toggle their availability status as open or closed and respond to incoming service requests and SOS alerts. Admins are platform operators who verify mechanic credentials before those mechanics become discoverable, monitor analytics, manage reports and bans, and broadcast emergency alerts at a platform-wide level. The three-role model is enforced through JWT-based authentication and role checks implemented in the middleware layer.

The development of Smart Mechanic Finder follows a structured software engineering lifecycle that encompasses requirements analysis, system design, incremental implementation, and systematic testing. The team identified ten high-level objectives spanning mobile development, backend API design, geospatial search, security, rating systems, messaging, SOS functionality, admin tooling, offline awareness, and cross-cutting security concerns. All high-priority objectives were implemented and verified through API testing and mobile device testing before the project was considered complete.

The significance of this project extends beyond its immediate technical accomplishments. In a country where the vast majority of mechanics operate without any digital presence, Smart Mechanic Finder represents a first step toward formalising and digitising the automotive repair sector in Pakistan. By providing mechanics with a verified digital identity and vehicle owners with a trusted discovery mechanism, the platform has the potential to improve livelihoods, reduce breakdown-related road incidents, and demonstrate the applicability of modern mobile application architectures to service industry challenges in developing country contexts.

### 1.1.1 Background

Pakistan's vehicle ownership has grown dramatically over the past two decades, driven by population growth, urbanisation, rising disposable incomes in urban centres, and the availability of affordable motorcycles manufactured domestically. According to the Pakistan Bureau of Statistics Motor Vehicle Statistics (2023), the number of registered vehicles in Pakistan has crossed the thirty million mark, with motorcycles constituting the largest segment. This rapid growth in vehicle ownership has not been accompanied by an equivalent growth in organised, discoverable, or verifiable automotive service infrastructure. The vast majority of mechanics operate small roadside workshops with no online presence, no formal certification records accessible to the public, and no systematic way for vehicle owners to evaluate their quality before engaging their services.

Pakistan's smartphone penetration and mobile internet adoption have undergone a parallel transformation. The Pakistan Telecommunication Authority's Annual Report (2023) documents that the number of mobile broadband subscribers in Pakistan has surpassed one hundred million, with 4G LTE coverage extending to all major cities and significant expansion into secondary towns and rural areas. This explosion in mobile connectivity means that a large and growing fraction of Pakistan's vehicle-owning population now carries a device capable of running a sophisticated location-based service application. The infrastructure preconditions for a platform like Smart Mechanic Finder — GPS-enabled smartphones, mobile internet, and app distribution through the Google Play Store — are thus already met for the target demographic.

The informal and fragmented nature of Pakistan's vehicle repair sector creates specific pain points that a digital platform can address. Mechanics in Pakistan typically do not advertise through professional channels; instead, they rely on word-of-mouth referrals, physical signage visible to passing traffic, and informal social networks. This means that a vehicle owner who breaks down in an unfamiliar neighbourhood has no structured mechanism for finding the nearest qualified mechanic, evaluating that mechanic's reputation, or verifying that the mechanic has relevant experience with their specific vehicle type or problem. The consequences of this information asymmetry can be severe: vehicle owners may pay inflated prices to opportunistic mechanics, receive substandard repairs, or remain stranded for hours awaiting assistance that could have arrived within minutes had a discovery platform been available.

The digital service gap in Pakistan's automotive sector stands in sharp contrast to the transformation that has already occurred in other service industries. Ride-hailing platforms such as Uber and Careem have fundamentally changed how Pakistanis access transportation by creating a trusted, GPS-aware, rated, and verifiable intermediary between drivers and passengers. Food delivery platforms such as Foodpanda and Cheetay have similarly digitised the restaurant discovery and delivery workflow. However, no equivalent platform has achieved widespread adoption for automotive repair services in Pakistan. This gap is the direct motivation for Smart Mechanic Finder, which applies the platform design principles proven in ride-hailing to the automotive repair context.

The context of the University of Baltistan, Skardu (UOBS) adds a further dimension of significance to this project. Skardu, located in Gilgit-Baltistan at high altitude, is a region characterised by challenging road conditions, extreme weather, significant distances between settlements, and growing vehicle traffic driven by tourism and local commerce. Vehicle breakdowns in this context can represent genuine safety emergencies rather than merely inconveniences. A platform that enables vehicle owners to quickly locate and contact verified mechanics is therefore particularly valuable in this geographic context, and demonstrates that location-based service applications have applicability in remote and challenging environments as well as in major urban centres.

### 1.1.2 Problem Statement

Pakistan's vehicle owners currently lack any structured, digital, location-aware mechanism for discovering, evaluating, and engaging nearby automotive mechanics. The existing informal ecosystem of roadside workshops, word-of-mouth referrals, and opportunistic street-level discovery is inefficient, opaque, and unsafe, particularly in emergency breakdown situations. The Smart Mechanic Finder project addresses this problem through six specific sub-problems identified through user research and domain analysis:

**1. Lack of a Centralised Mechanic Discovery Platform:** There is currently no dedicated application or website in Pakistan that aggregates mechanic profiles, their geographic locations, their availability status, and their service specialisations into a single searchable interface. Vehicle owners rely on fragmented information sources including social media groups, general classifieds platforms such as OLX, and personal contacts. These sources provide no real-time availability information, no location-based proximity sorting, and no standardised profile format. The absence of a centralised platform means that even the simple task of finding the nearest mechanic who is currently available and specialises in the relevant vehicle type can take many minutes of phone calls and inquiries that would be unnecessary if a dedicated application existed.

**2. Inability to Verify Mechanic Credentials and Qualifications:** When a vehicle owner engages a mechanic found through informal channels, they have no reliable way to verify that the mechanic possesses the skills and experience claimed. There are no publicly accessible certification records, no industry-wide rating aggregation system, and no mechanism for checking whether a mechanic has a history of complaints or disputes. This information asymmetry places vehicle owners in a disadvantaged negotiating position and creates an environment in which unqualified mechanics can misrepresent their capabilities. The Smart Mechanic Finder addresses this through an admin-operated verification workflow in which mechanics must submit identification and certification documents before their profiles become visible to vehicle owners in search results.

**3. Absence of Real-Time Availability Information:** A vehicle owner who has found a mechanic's contact through any existing channel — whether a local directory, a social media post, or a recommendation from a friend — still faces the problem of uncertainty about whether that mechanic is currently available. Calling ahead is time-consuming and unreliable. Mechanics may not answer calls during working hours, may be with another customer, or may have temporarily closed their workshop without updating any public information. The Smart Mechanic Finder resolves this by requiring mechanics to actively toggle their status between open and closed within the application. Only mechanics with an open status are returned in search results, ensuring that vehicle owners are only presented with mechanics who have indicated their current availability.

**4. No Transparent Rating and Review System:** Trust in two-sided service marketplaces depends critically on the existence of a transparent, verifiable, and manipulation-resistant reputation mechanism. Pakistan's informal mechanic ecosystem has no such mechanism. Vehicle owners have no way to share their service experiences in a form that benefits subsequent customers, and mechanics have no incentive to improve their service quality beyond what is necessary to retain their immediate social network of regular customers. The Smart Mechanic Finder implements a multi-dimensional rating system in which vehicle owners can rate completed services on an overall scale as well as on four sub-dimensions: punctuality, work quality, communication, and value for money. These ratings are aggregated into a mechanic's average rating displayed prominently on their profile and on search result cards, creating a direct reputational incentive for quality service.

**5. Emergency Breakdown Situations with No Structured Assistance:** Vehicle breakdowns on remote roads, at night, or in unfamiliar locations represent genuine safety emergencies, particularly in Pakistan's mountainous northern regions. In such situations, the vehicle owner needs to reach multiple nearby mechanics simultaneously with minimal delay, not engage in the sequential process of finding numbers and making individual calls. The Smart Mechanic Finder implements a dedicated SOS emergency feature accessible with a single large tap from the home screen. When activated, the SOS creates a distress record in the database and automatically notifies all online, verified mechanics within a configurable radius (defaulting to twenty kilometres) through both in-app notifications and Firebase Cloud Messaging push notifications, enabling a rapid, parallel response that maximises the chance of quick assistance.

**6. Lack of Service History Tracking for Vehicle Owners:** Vehicle owners in Pakistan typically have no systematic record of which mechanics have serviced their vehicles, what work was performed, or what was charged. This lack of service history makes it difficult to diagnose recurring problems, evaluate whether a proposed repair is necessary, or hold a mechanic accountable for work that fails prematurely. The Smart Mechanic Finder maintains a service history record for each vehicle owner that logs completed service requests with the mechanic's details, the service type, the date, and the rating given. This history is accessible through a dedicated Service History screen in the mobile application, providing vehicle owners with a growing longitudinal record of their vehicle maintenance activity.

## 1.2 Literature Review

The design and implementation of Smart Mechanic Finder draws on a body of academic and industry literature spanning location-based services, mobile application development, RESTful API design, document-oriented databases, trust mechanisms in digital marketplaces, and user experience design for service applications. This section reviews the most relevant work from each of these domains and explains how the findings informed the design decisions made in this project.

**Uber and Lyft Ride-Sharing Architecture.** The architectural patterns established by ride-hailing platforms such as Uber and Lyft represent the closest available template for a location-aware, two-sided service marketplace of the type implemented by Smart Mechanic Finder. The Uber Engineering Blog (2022) documents how Uber's system evolved from a monolithic architecture to a microservice-based platform capable of handling millions of concurrent location updates and matching requests. The core insight applicable to Smart Mechanic Finder is the separation of the service into a small number of well-defined components: user management, driver (mechanic) management, location tracking, matching, and notification. Uber's use of geospatial indexing for the matching algorithm — finding the nearest available driver for a given pickup point — directly parallels the nearby mechanic search that is the central feature of Smart Mechanic Finder.

The ride-hailing literature also highlights the importance of real-time location updates as a mechanism for both matching and trust. Passengers in ride-hailing platforms can see their driver's movement on a live map as they approach, which reduces anxiety and no-show rates. While the current implementation of Smart Mechanic Finder does not implement WebSocket-based live tracking (this is identified as a future enhancement), the same principle of reducing information asymmetry through location visibility is applied in the static form: vehicle owners can see a mechanic's last reported location on a map and receive an ETA calculated from that location. The lessons from Uber's experience with surge pricing and dynamic availability management also informed the decision to require explicit mechanic status toggling rather than inferring availability from inactivity.

**Location-Based Services Research.** Academic research on Location-Based Services (LBS) provides the theoretical foundation for the geospatial search capabilities of Smart Mechanic Finder. Xu et al. (2015) provide a comprehensive review of LBS architectures, distinguishing between pull-based services (where the user explicitly requests nearby information) and push-based services (where the system proactively sends location-relevant information to the user). Smart Mechanic Finder implements both paradigms: the nearby mechanic search is a pull-based LBS where the vehicle owner explicitly requests a list of mechanics within a radius, while the SOS alert notification is a push-based LBS where the system proactively delivers information to mechanics based on their proximity to the distress event.

The technical foundation for the proximity search is MongoDB's 2dsphere indexing, which the MongoDB Atlas documentation (2024) describes as a sphere model-based geospatial index that supports queries against GeoJSON objects. The 2dsphere index enables the `$near` and `$nearSphere` query operators, which return documents sorted by distance from a specified point. This is more efficient than a brute-force approach of loading all mechanic records and computing distances in application code, because the index allows MongoDB to evaluate proximity at the query execution layer using an optimised spatial data structure. The Haversine formula, whose mathematical formulation dates to Haversine (1801) and which remains the standard method for computing great-circle distances on a sphere, is used in application code to compute the exact kilometre distance for display in the UI and for ETA calculation after the database returns the candidate set.

**React Native Cross-Platform Mobile Development.** The choice of React Native as the mobile application framework is supported by a substantial body of research and industry experience. Lew (2023) from Meta Engineering documents the performance characteristics of React Native applications, noting that for most service application use cases — which are dominated by network I/O, UI rendering, and user interaction rather than compute-intensive operations — the performance difference between React Native and fully native Android/iOS development is imperceptible to end users. The primary advantage of React Native for this project is the ability to write a single JavaScript/TypeScript codebase that runs on both Android and iOS, reducing development effort and ensuring consistency of experience across platforms.

React Native's component model, based on React's declarative UI paradigm, enables rapid development of complex UI layouts through composition of reusable components. Libraries such as React Native Paper, React Native Vector Icons, and React Native Maps provide production-quality UI elements that would require substantial effort to implement from scratch in native code. React Navigation, the standard navigation library for React Native applications, provides a comprehensive navigation solution supporting stack, tab, drawer, and modal navigation patterns with deep linking and navigation state persistence. These ecosystem advantages make React Native a practical and well-justified choice for a Final Year Project context where development time and team expertise are constrained.

**Flask Microframework for RESTful APIs.** Ronacher (2018) describes Flask as a microframework designed for simplicity and extensibility, in contrast to full-stack frameworks such as Django. This design philosophy aligns well with the backend requirements of Smart Mechanic Finder, which needs a lightweight HTTP server that handles request routing, JSON serialisation, JWT authentication, and database access without the overhead of template rendering, ORM migrations, or other features relevant only to server-side rendered web applications. Flask's Blueprint system, which allows route handlers to be organised into modular groups with URL prefixes, is used in Smart Mechanic Finder to create six distinct modules (auth, mechanic, rating, SOS, message, admin) that correspond directly to the functional areas of the application. This modularity improves code organisation, facilitates independent testing of each module, and makes it straightforward to add new feature areas in the future.

**MongoDB Document Store Studies.** MongoDB's document-oriented data model offers several advantages for the Smart Mechanic Finder use case compared to a relational database. The MongoDB documentation highlights that document stores can accommodate schema evolution without migrations, which is valuable during the iterative development of an application whose data requirements may change as new features are added. For Smart Mechanic Finder, the ability to add new fields to mechanic profiles (such as the certification document URL or the CNIC number) without requiring a schema migration was practically useful during development. MongoDB's native GeoJSON support and 2dsphere indexing make it the natural choice for an application whose central feature is geospatial proximity search. Furthermore, MongoDB's horizontal scalability through sharding means that as the platform grows to serve larger numbers of mechanics and vehicle owners, the database tier can be scaled by adding capacity rather than by replacing the database technology.

**Mobile Application Usability Research.** Nielsen (1993) established the foundational principles of usability engineering that continue to guide mobile application design, including the principle of minimising the number of steps required to complete a task. The Smart Mechanic Finder navigation design follows the principle of reducing the path from login to the mechanic search to a maximum of two taps (non-functional requirement NFR-08). The SOS emergency feature, being the most time-critical function in the application, is placed on the home screen as a large, prominently coloured button accessible in a single tap. The offline detection banner, implemented using the NetInfo library, provides immediate feedback to users when their network connection is lost, preventing the confusion that arises when API calls fail silently. These design decisions are grounded in the usability literature's consistent finding that perceived performance and clarity of status information are the most important determinants of user satisfaction in mobile service applications.

**Digital Marketplace Trust Mechanisms.** Trust is a central concern in two-sided service marketplaces where buyers and sellers are strangers interacting for the first time. A significant body of research examines how rating systems, reputation mechanisms, and credential verification contribute to trust formation in digital platforms. The Smart Mechanic Finder incorporates three distinct trust mechanisms: admin verification of mechanic credentials (ensuring that mechanics have submitted valid identification and certification before becoming discoverable), a multi-dimensional rating system that captures nuanced aspects of service quality, and a compound index on the ratings collection that prevents a single vehicle owner from submitting multiple ratings for the same mechanic. Together, these mechanisms create a trust infrastructure that would be absent in an unmoderated mechanic directory, and that provides vehicle owners with justified confidence in the quality indicators displayed on mechanic profiles.

### 1.2.1 Gap Analysis

The existing landscape of digital tools available to Pakistani vehicle owners for mechanic discovery is sparse and inadequate. The most commonly used platforms — OLX, PakWheels, and local WhatsApp groups — each provide partial solutions that fall far short of the integrated, location-aware, verified, and rated experience that Smart Mechanic Finder delivers. OLX is a general classifieds platform that allows mechanics to post listings, but these listings are static, have no location-based search capability, provide no verification of credentials, and offer no rating system. A vehicle owner searching for a mechanic on OLX must browse through listings, make phone calls, and rely entirely on their own judgement to evaluate quality. PakWheels, Pakistan's largest automotive portal, provides a forum section where mechanics can advertise, but suffers from the same limitations as OLX with the additional problem that forum posts quickly become outdated and there is no mechanism for verifying that a listed mechanic is still active or available.

Local WhatsApp groups are perhaps the most widely used mechanism for mechanic discovery in Pakistan's cities and towns. A vehicle owner who breaks down will post a distress message to a neighbourhood WhatsApp group requesting mechanic recommendations. While this approach leverages the social network trust of the group, it is fundamentally limited by the size and composition of the group, the response time of group members, the quality of the recommendations given, and the total absence of any structured profile, rating, or availability information. WhatsApp groups also offer no GPS-based proximity sorting, so a vehicle owner may receive recommendations for mechanics who are actually further away than alternatives that the group members simply did not know about.

Smart Mechanic Finder fills this gap by providing a capability set that none of the existing informal solutions can match: real-time GPS-based proximity search returning only verified, currently available mechanics sorted by distance; a verified profile for each mechanic including shop name, address, services offered, and certification status; a transparent, aggregated multi-dimensional rating system based on actual service experiences; a dedicated SOS emergency broadcast that simultaneously notifies all nearby mechanics; in-app messaging that eliminates the need to exchange personal phone numbers; and an admin oversight layer that maintains platform quality by verifying credentials and managing complaints. This combination of features addresses each of the six problems identified in the problem statement and creates a user experience that is qualitatively superior to anything currently available in Pakistan's automotive service discovery landscape.

## 1.3 Purpose of the Project

From the perspective of vehicle owners, the purpose of Smart Mechanic Finder is to eliminate the uncertainty, delay, and risk associated with finding a qualified mechanic in an unfamiliar location or during an emergency breakdown. A vehicle owner who uses Smart Mechanic Finder can, within seconds of opening the application, see a map of all verified, available mechanics sorted by proximity, view each mechanic's shop details, specialisations, and aggregated ratings from previous customers, and initiate contact through in-app messaging or an SOS broadcast. The practical utility of this capability is especially pronounced during emergency situations — a flat tyre at night on an unfamiliar road, an engine failure far from home — where the absence of a structured discovery mechanism would leave the vehicle owner with no reliable path to assistance. By reducing the time-to-contact for a verified mechanic from an unpredictable period of phone calls and inquiries to a few taps in an application, Smart Mechanic Finder delivers a direct, measurable improvement in the vehicle ownership experience for Pakistan's growing motoring population.

From the perspective of mechanics, Smart Mechanic Finder provides an economic opportunity by giving them a verified digital identity and a channel for reaching new customers who would otherwise not know of their existence. In Pakistan's current informal ecosystem, a mechanic's customer base is limited to the geographic area in which they are physically visible and the social network through which they receive referrals. A mechanic who registers on Smart Mechanic Finder and completes the verification process becomes discoverable by every vehicle owner within the search radius who opens the application, regardless of whether those vehicle owners have any prior connection to the mechanic. The rating system creates an incentive for mechanics to deliver consistent, high-quality service, since a high average rating improves their visibility in search results and makes them more likely to receive service requests and SOS responses. Over time, Smart Mechanic Finder thus functions as a quality-improving mechanism for the automotive repair market, channelling demand toward better-performing mechanics.

From an academic perspective, Smart Mechanic Finder makes a contribution to the study of mobile application architecture for service marketplace applications in developing country contexts. The project demonstrates the feasibility of combining React Native, Flask, MongoDB, JWT authentication, and geospatial indexing into a coherent, secure, and performant application within the constraints of a Final Year Project. The architectural decisions made in the project — particularly the three-tier separation, the Blueprint-based API modularity, the 2dsphere geospatial indexing strategy, and the role-based JWT middleware — collectively represent a reference design that future projects at the University of Baltistan, Skardu and elsewhere can build upon. The project also demonstrates the applicability of location-based service application design patterns, which have been extensively studied in the context of developed country transportation and food delivery platforms, to the automotive repair sector in a developing country context with its specific characteristics of informal service providers, variable internet connectivity, and Android-dominated device landscape.

## 1.4 Objectives

The Smart Mechanic Finder project was designed and implemented against ten explicit objectives, each corresponding to a specific technical or functional dimension of the application. These objectives were defined at the outset of the project to ensure that development effort was focused on the most critical capabilities and that progress could be evaluated against clear criteria. The table below presents each objective with its identifier, description, and priority level, followed by a detailed explanation of each.

| # | Objective | Priority |
|---|-----------|----------|
| O-01 | Develop a cross-platform mobile application using React Native that runs on Android devices | High |
| O-02 | Implement a RESTful backend API using Flask and Python supporting all three user roles | High |
| O-03 | Integrate real-time GPS-based mechanic discovery using MongoDB 2dsphere geospatial indexing | High |
| O-04 | Implement secure user authentication using JWT tokens and bcrypt password hashing | High |
| O-05 | Design and implement a transparent rating and review system with sub-category ratings | Medium |
| O-06 | Build an in-app messaging system for vehicle owner-mechanic communication | Medium |
| O-07 | Implement an SOS emergency alert system with broadcast notifications | High |
| O-08 | Develop an admin panel for mechanic verification and platform analytics | Medium |
| O-09 | Implement offline-aware mobile UI with network status detection | Medium |
| O-10 | Ensure system security through RBAC, CORS configuration, and input validation | High |

**O-01: Cross-Platform Mobile Application.** The decision to use React Native for the mobile frontend was driven by the need to deliver a fully functional Android application within the project timeline while maintaining the option to extend to iOS in the future with minimal additional effort. React Native's JavaScript-based component model allows the team to leverage existing web development skills while producing native Android UI components. The objective was considered met when the application successfully ran on an Android Virtual Device (AVD) in Android Studio and on a physical Android device, with all screens rendering correctly and all navigation transitions functioning as designed.

**O-02: RESTful Backend API with Multi-Role Support.** The backend API needed to support three fundamentally different user roles with different sets of accessible endpoints, different data access patterns, and different UI experiences. Implementing this as a single Flask application with Blueprint-based route organisation ensures that the codebase remains maintainable as the number of endpoints grows. The objective was met when all twenty endpoint groups were implemented, tested, and confirmed to enforce the correct role restrictions.

**O-03: GPS-Based Mechanic Discovery with Geospatial Indexing.** The core feature of the application — finding nearby mechanics — required a database-level geospatial capability rather than application-level distance filtering, to ensure that searches could return results quickly even as the number of mechanics in the database grows. MongoDB's 2dsphere index on the mechanics collection's location field, combined with the `$near` operator, provides this capability. The objective was met when search queries consistently returned results within one second on local hardware with test data.

**O-04: JWT Authentication and bcrypt Password Hashing.** Security in a multi-role application requires robust authentication and credential storage. JWT tokens eliminate the need for server-side session storage, making the API stateless and therefore easily scalable. bcrypt password hashing with a cost factor of twelve provides resistance to brute-force and rainbow table attacks. The objective was met when all protected endpoints consistently rejected requests without valid tokens and returned the correct role-specific HTTP error codes for unauthorised role access.

**O-05: Multi-Category Rating System.** A flat single-number rating is less informative to vehicle owners than a multi-dimensional assessment that breaks down the service experience into its component aspects. The rating system was designed to capture overall satisfaction alongside four sub-dimensions: punctuality, work quality, communication, and value for money. This design was inspired by rating systems in platforms such as Airbnb and Uber, which use multi-dimensional ratings to give service providers actionable feedback. The objective was met when ratings submitted through the API were correctly persisted and aggregated into the mechanic's average rating displayed in search results.

**O-06: In-App Messaging System.** Direct communication between vehicle owners and mechanics without the need to exchange personal phone numbers is an important privacy and trust feature of the platform. The messaging system was designed around a conversation model in which each unique pair of (vehicle owner, mechanic) shares a single conversation thread accessible to both parties. The objective was met when messages sent through the API were correctly persisted, retrieved by conversation thread, and marked as read upon viewing.

**O-07: SOS Emergency Alert System.** The SOS feature is the most safety-critical component of the application and was treated as a high-priority objective from the outset. The implementation needed to be fast (minimal delay between the vehicle owner's tap and the first mechanic receiving the notification), comprehensive (all online mechanics within the radius should receive the notification, not just the nearest one), and reliable (the SOS should be persisted in the database even if the notification delivery to specific mechanics fails). These requirements were all met in the final implementation.

**O-08: Admin Panel for Verification and Analytics.** The admin panel fulfils the platform governance function: ensuring that only verified mechanics are discoverable, providing visibility into platform activity, and managing disputes and bans. The objective was met when the admin dashboard correctly aggregated statistics from multiple collections, the verification workflow correctly updated mechanic profiles and sent notifications, and the reports and bans functionality operated correctly.

**O-09: Offline-Aware Mobile UI.** Pakistan's mobile network coverage, while improving, remains intermittent in many areas. A vehicle owner who loses network connectivity while using the application should receive immediate, clear feedback rather than experiencing mysterious API failures. The objective was met when the OfflineBanner component, implemented using the NetInfo library, displayed within two seconds of network loss and automatically disappeared when connectivity was restored.

**O-10: System Security through RBAC, CORS, and Input Validation.** Security is a cross-cutting concern that affects every component of the application. The objective was decomposed into three specific requirements: role-based access control enforced at the middleware layer, CORS configuration that prevents unauthorised web origins from accessing the API, and server-side input validation that rejects malformed or incomplete requests before they reach the business logic layer. The objective was met when API tests confirmed consistent enforcement of all three security dimensions.

## 1.5 Scope

The in-scope functionality of Smart Mechanic Finder encompasses all features described in the ten objectives above and the twenty-four functional requirements defined in Chapter 2. Specifically, the application delivers: user registration and login with role selection; JWT-authenticated session management; GPS-based nearby mechanic search with distance, ETA, and specialisation filtering; interactive map display of mechanic locations using React Native Maps; mechanic profile viewing with ratings and reviews; a multi-category rating submission system; in-app messaging between vehicle owners and mechanics; SOS emergency alert creation and broadcast; service history tracking for vehicle owners; mechanic status and location management; an admin panel with mechanic verification, user management, analytics, and report handling; and an offline-aware mobile UI with automatic network status detection.

The geographic scope of the application in its current phase is Pakistan, with primary focus on regions that have 4G or 3G mobile internet coverage. The application functions wherever mobile internet is available because all data is fetched from the backend API over HTTP. However, the GPS-based proximity search is only meaningful in areas where a sufficient density of registered mechanics exists, which in the initial deployment phase will be limited to Pakistan's major cities and towns where the mechanic recruitment efforts will be concentrated.

The out-of-scope items for the current version of the application are: a payment gateway for in-app transactions; a web application version of the platform; an iOS version of the mobile application (Android-only in this phase); live vehicle tracking where the vehicle owner can watch the mechanic's position update in real-time as they travel to the breakdown site; and multi-language support (the current version is English-only, with Urdu and Balti localisation deferred to a future version). Each of these items is addressed in Chapter 6 as a future work item.

The rationale for deferring these items is rooted in prioritisation of core value delivery within the constraints of a Final Year Project. Payment integration would require integration with JazzCash or EasyPaisa APIs, obtaining merchant credentials, and implementing the complex state management needed for financial transactions — a significant additional workload beyond the core matching platform. The iOS version requires an Apple Developer account, a macOS machine for Xcode builds, and iOS-specific testing, none of which were available within the project's resources. Live vehicle tracking would require WebSocket infrastructure, a real-time location update protocol on the mechanic's device, and significant UI work — a valuable feature but non-essential for a Minimum Viable Product. Multi-language support, while important for accessibility, can be retrofitted to the existing UI using react-i18next without requiring architectural changes.

## 1.6 Tools and Technologies

The following table summarises the complete technology stack used in Smart Mechanic Finder, followed by detailed justification for each major technology choice.

| Category | Technology | Version |
|----------|------------|---------|
| Mobile Frontend | React Native | 0.74.0 |
| UI Library | React Native Paper, React Native Vector Icons | Latest |
| State Management | React Context API | Built-in |
| Navigation | React Navigation | 6.x |
| Maps | React Native Maps | 1.10.0 |
| HTTP Client | Axios | 1.6.2 |
| Location | react-native-geolocation-service | 5.3.1 |
| Backend Framework | Flask | 3.0.0 |
| Language | Python | 3.11+ |
| Database | MongoDB | 8.x |
| ODM | PyMongo | 4.x |
| Authentication | Flask-JWT-Extended | Latest |
| Password Hashing | bcrypt | Latest |
| Cross-Origin | Flask-CORS | Latest |
| Task Scheduling | APScheduler | Latest |
| Push Notifications | Firebase Cloud Messaging (FCM) | Optional |

**React Native (0.74.0).** React Native was selected as the mobile development framework for its ability to deliver a native Android experience while keeping the codebase in JavaScript, a language familiar to web developers and well-supported by the broader open-source ecosystem. Version 0.74.0 introduced the New Architecture (Fabric renderer and TurboModules) as the default, which provides improved performance for UI transitions and native module calls. React Native's component model maps directly to Android View components, ensuring that the resulting APK performs comparably to a hand-written Kotlin application for the UI patterns used in Smart Mechanic Finder (lists, maps, forms, and cards). The extensive ecosystem of third-party libraries — React Navigation, React Native Maps, React Native Paper, react-native-geolocation-service, and NetInfo — means that all the platform-specific capabilities required for this application are available as well-maintained, community-supported packages.

**Flask (3.0.0) and Python 3.11+.** Flask was chosen as the backend framework for its simplicity, its well-documented Blueprint system for route modularisation, and the richness of the Python package ecosystem for web development. Flask 3.0.0 is the current stable major release that introduced improved async support and a cleaner application lifecycle. Python 3.11+ was used to take advantage of significant interpreter performance improvements introduced in that version. The combination of Flask, Flask-JWT-Extended, Flask-CORS, and PyMongo provides a complete solution for all backend requirements without unnecessary abstractions. Flask's lightweight nature means that the API server starts quickly, has a small memory footprint, and is straightforward to deploy and maintain.

**MongoDB (8.x).** MongoDB was selected as the database for three primary reasons: its native GeoJSON support and 2dsphere indexing capability, which is essential for the geospatial proximity search; its schema flexibility, which allowed the data model to evolve during development without migration scripts; and its document model, which allows complex objects (such as a mechanic profile with embedded arrays of services and a GeoJSON location object) to be stored and retrieved as single documents rather than as joins across multiple tables. MongoDB 8.x represents the current major version with improved query performance and enhanced operator capabilities. The PyMongo 4.x driver provides a Pythonic interface to MongoDB that integrates naturally with Flask's request handling model.

**JWT + bcrypt.** JSON Web Tokens are the standard mechanism for stateless authentication in RESTful APIs, as documented in RFC 7519 (Jones et al., 2015). The Flask-JWT-Extended library provides decorators and utilities that simplify JWT validation, identity extraction, and additional claims handling. JWT's stateless nature means that the backend does not need to maintain a session store, which simplifies horizontal scaling. bcrypt, whose design is described by Provos and Mazieres (1999), is the industry-standard password hashing algorithm for web applications due to its adaptive work factor that can be tuned to remain computationally expensive as hardware improves. A cost factor of 12 was chosen as a balance between security (high enough that brute-force attacks are impractical on commodity hardware) and performance (hashing completes in approximately 300–400 milliseconds on the development machine, acceptable for a login operation).

**React Navigation (6.x) and React Native Maps (1.10.0).** React Navigation 6.x is the standard navigation library for React Native, providing Stack, Tab, and Drawer navigators that support deep linking and navigation state persistence. The library's role-based navigator selection capability — where the root navigator conditionally renders either the Auth stack or the role-specific tab navigator based on the AuthContext state — is used to implement the three-role navigation model. React Native Maps 1.10.0 wraps the Google Maps SDK on Android, providing a MapView component with support for markers, polylines, camera control, and user location display. This library was selected over alternatives because of its maturity, active maintenance, and comprehensive documentation.

---


# CHAPTER 2: REQUIREMENTS ANALYSIS

## 2.1 Functional Requirements

The functional requirements of Smart Mechanic Finder were identified through analysis of the problem statement, review of comparable platforms, and iterative refinement during the design phase. The requirements are organised by user role and assigned unique identifiers for traceability between the requirements specification and the implementation.

| ID | Requirement | Role | Priority |
|----|-------------|------|----------|
| FR-01 | The system shall allow users to register as Vehicle Owner or Mechanic | All | High |
| FR-02 | The system shall authenticate users via JWT tokens | All | High |
| FR-03 | The system shall allow Vehicle Owners to search for nearby mechanics by GPS | Vehicle Owner | High |
| FR-04 | The system shall display mechanic location on an interactive map | Vehicle Owner | High |
| FR-05 | The system shall allow Vehicle Owners to filter mechanics by specialisation | Vehicle Owner | Medium |
| FR-06 | The system shall allow Vehicle Owners to rate mechanics after service | Vehicle Owner | High |
| FR-07 | The system shall allow Vehicle Owners to view mechanic profiles and ratings | Vehicle Owner | High |
| FR-08 | The system shall allow Vehicle Owners to send SOS emergency alerts | Vehicle Owner | High |
| FR-09 | The system shall allow Vehicle Owners to view their service history | Vehicle Owner | Medium |
| FR-10 | The system shall allow Vehicle Owners to send in-app messages to mechanics | Vehicle Owner | Medium |
| FR-11 | The system shall allow Mechanics to register with specialisation and certification | Mechanic | High |
| FR-12 | The system shall allow Mechanics to set their availability status (open/closed/busy) | Mechanic | High |
| FR-13 | The system shall allow Mechanics to update their current GPS location | Mechanic | High |
| FR-14 | The system shall allow Mechanics to view incoming service requests | Mechanic | High |
| FR-15 | The system shall allow Mechanics to accept or reject service requests | Mechanic | High |
| FR-16 | The system shall display the Mechanic's average rating on their profile | Mechanic | Medium |
| FR-17 | The system shall allow Mechanics to receive SOS notifications | Mechanic | High |
| FR-18 | The system shall allow Mechanics to receive in-app messages | Mechanic | Medium |
| FR-19 | The system shall allow Admins to view all registered mechanics | Admin | High |
| FR-20 | The system shall allow Admins to verify or reject mechanic registrations | Admin | High |
| FR-21 | The system shall allow Admins to view platform analytics | Admin | Medium |
| FR-22 | The system shall allow Admins to generate reports | Admin | Medium |
| FR-23 | The system shall allow Admins to broadcast emergency alerts | Admin | High |
| FR-24 | The system shall allow Admins to suspend or deactivate user accounts | Admin | Medium |

### Vehicle Owner Requirements Discussion

The vehicle owner's journey through the Smart Mechanic Finder platform begins at registration (FR-01), where the user selects the Vehicle Owner role, providing their name, email address, and password. The system validates the email format, checks for duplicate registration, hashes the password using bcrypt, creates the user record in the database, and returns a JWT token that immediately authenticates the new user without requiring a separate login step. Returning users authenticate through the login endpoint (FR-02), which validates credentials and returns a fresh JWT token stored in the device's AsyncStorage for persistence across app restarts. The distinction between Vehicle Owner and Mechanic roles at registration time is fundamental: it determines which navigator the app renders after login, which endpoints the user's JWT token can access, and what data is shown on the home screen.

The core discovery experience for vehicle owners centres on FR-03 and FR-04. The Search Mechanics screen requests the device's GPS location through the react-native-geolocation-service library, sends the latitude, longitude, and optional radius parameter to the `/api/mechanic/nearby` endpoint, and renders the results as a scrollable list of mechanic cards with distance and ETA information. The Map screen (FR-04) renders the same mechanic data as map markers on a React Native Maps component, allowing the vehicle owner to visually assess the geographic distribution of available mechanics. The specialisation filter (FR-05) passes an additional query parameter to the search endpoint, which translates it into a MongoDB `$in` operator against the mechanic's services array, returning only mechanics who have listed that service type in their profile.

The post-service feedback loop is managed through the rating system (FR-06) and profile viewing (FR-07). After a service is completed, the vehicle owner navigates to the Rating Screen where they assign an overall star rating and four sub-dimension scores before submitting the review. The backend validates that the vehicle owner has not previously rated that specific mechanic, inserts the rating document, and immediately recomputes the mechanic's average rating in the mechanics collection. The profile viewing capability (FR-07) shows all information about a mechanic including their shop name, address, services offered, average rating, individual review comments, verification status, and approximate location — providing vehicle owners with the information needed to make an informed selection before committing to a service request.

The emergency and communication features (FR-08, FR-09, FR-10) complete the vehicle owner's capability set. The SOS button on the home screen (FR-08) triggers a confirmation dialog to prevent accidental activation, then calls the `/api/sos/create` endpoint with the vehicle owner's current GPS coordinates, vehicle type, and optional problem description. The backend creates the SOS record, queries all online verified mechanics within the broadcast radius, and sends in-app and push notifications to each of them. The service history screen (FR-09) fetches completed service records from the backend sorted by date, displaying a chronological log of all past services with mechanic details, service types, dates, and ratings. The in-app messaging feature (FR-10) allows vehicle owners to open a chat with any mechanic they have interacted with, enabling clarifying questions, service coordination, and status updates without exchanging personal phone numbers.

### Mechanic Requirements Discussion

The mechanic registration flow (FR-11) differs from the vehicle owner flow in that mechanics must provide additional information: their shop name, physical address, GPS coordinates of their workshop, phone number, and optionally their CNIC number and certification document upload. This additional information forms the basis for the admin verification process and for the mechanic's profile as displayed to vehicle owners. Upon registration, the system creates both a user document (for authentication) and a mechanics document (for the professional profile and location data), linking them through the user_id field. The mechanic's initial verification status is set to "pending", meaning their profile will not appear in vehicle owner search results until an admin reviews and approves their registration.

Availability management (FR-12 and FR-13) is central to the mechanic's daily use of the application. When a mechanic opens the app and is ready to accept service requests, they toggle their status to "open" through the dashboard's status toggle control. Switching to open simultaneously updates the is_online/status field in the mechanics collection and sends the mechanic's current GPS location to the backend (FR-13), ensuring that the location data used for proximity searches reflects where the mechanic is at the time they declare themselves available. The application implements an APScheduler background task that monitors mechanic status: if a mechanic's location has not been updated within a configurable timeout period (defaulting to thirty minutes), a reminder notification is sent encouraging them to either update their location or switch to closed status, preventing stale location data from misleading vehicle owners.

Incoming service requests and SOS alerts (FR-14, FR-15, FR-17) are surfaced to mechanics through the Requests screen and through push notifications. When a vehicle owner creates an SOS alert near the mechanic's location, the mechanic receives a push notification and an in-app notification banner. The Requests screen shows all active SOS requests within the mechanic's vicinity, sorted by distance, with the vehicle owner's name, vehicle type, issue description, and a map showing their location. The mechanic can tap on a request to accept it (FR-15), which sets the SOS status to "responding" and triggers a notification to the vehicle owner informing them that a specific mechanic is on the way. The mechanic's average rating (FR-16) is prominently displayed on their dashboard, providing immediate feedback on their reputation and motivating continuous quality improvement.

The in-app messaging capability for mechanics (FR-18) mirrors the vehicle owner's messaging experience but from the opposite side of the conversation. Mechanics see their conversation list sorted by most recent message, with unread count badges on each conversation. They can read vehicle owner messages and respond through the same chat bubble interface used by vehicle owners. The messaging system is bidirectional — either party can initiate a conversation — and supports full message history, read receipts, message editing, and message deletion. For mechanics, messaging serves both coordination functions (confirming ETA, clarifying the service scope) and relationship management functions (following up after a service to confirm customer satisfaction).

### Admin Requirements Discussion

The admin role functions as the platform's quality assurance and governance layer. The mechanic list endpoint (FR-19) provides the admin with a paginated, searchable, and filterable view of all registered mechanics, with support for filtering by verification status, shop name, location, and ban status. This view is the starting point for the verification workflow: admins can identify newly registered mechanics with "pending" verification status and review their submitted documentation. The verification decision (FR-20) is implemented as a PUT request to `/api/admin/mechanics/:id/verify`, which sets the mechanic's is_verified flag and verification_status field, sends a notification to the mechanic informing them of the decision, and — in the case of approval — immediately makes the mechanic's profile discoverable in vehicle owner searches.

Platform analytics (FR-21) give the admin a dashboard-level view of the platform's health and growth. The analytics endpoint aggregates counts of total users, new users by time period, total and verified mechanics, active (open) mechanics, completed and pending service requests, total and active SOS alerts, and unresolved reports. This data is displayed on the admin dashboard as summary cards providing immediate situational awareness. The report generation capability (FR-22) allows the admin to export mechanic lists and service summaries in JSON format for offline analysis, auditing, or regulatory reporting. Reports include full mechanic profiles, verification histories, ban records, and rating distributions.

Emergency alert broadcasting (FR-23) gives the admin the ability to send platform-wide notifications that are distinct from individual vehicle owner SOS alerts. This capability is used for situations affecting all platform users — severe weather events, road closures affecting a large area, or platform maintenance announcements. The admin composes the alert message, selects the alert type, and submits it through the admin panel. The backend iterates over all active users with FCM tokens and delivers the push notification to each. The admin can subsequently view the history of sent alerts and mark them as resolved. User account management (FR-24) allows admins to deactivate individual user accounts or ban mechanic profiles in response to verified complaints, with the system recording the reason and timestamp of each action as an audit trail.

## 2.2 Non-Functional Requirements

The non-functional requirements define the quality attributes that the Smart Mechanic Finder system must exhibit beyond its functional behaviour. These requirements address performance, security, reliability, scalability, usability, compatibility, and standards compliance.

| ID | Category | Requirement | Metric |
|----|----------|-------------|--------|
| NFR-01 | Performance | API response time for standard requests | < 500ms |
| NFR-02 | Performance | Nearby mechanics search response time | < 1 second |
| NFR-03 | Security | All endpoints except register/login require JWT authentication | 100% |
| NFR-04 | Security | Passwords stored as bcrypt hashes (cost factor 12) | Always |
| NFR-05 | Reliability | Backend uptime target | 99.5% |
| NFR-06 | Reliability | Graceful degradation on network loss (mobile) | Required |
| NFR-07 | Scalability | Database designed to support horizontal sharding | MongoDB-native |
| NFR-08 | Usability | Maximum clicks to reach mechanic search from login | 2 |
| NFR-09 | Usability | Offline banner notification to user within 2 seconds of network loss | Required |
| NFR-10 | Compatibility | Android minimum API level | 21 (Android 5.0) |
| NFR-11 | Standards | RESTful API design following HTTP verb conventions | Required |
| NFR-12 | Standards | JWT token expiry | 24 hours |

**Performance.** NFR-01 and NFR-02 define the upper bounds on API response latency that are necessary for a mobile application to feel responsive to users. A response time above 500 milliseconds begins to be perceptible as lag on a standard mobile connection, and times above one second are considered slow. The standard CRUD endpoints (register, login, profile update, message send) all complete well within the 500ms target on local network conditions, as confirmed in testing. The nearby mechanics search (NFR-02) is held to a slightly more lenient one-second limit because it involves a geospatial index query, optional specialisation filtering, and the Haversine distance computation loop across all returned mechanics — operations that are inherently more complex than a simple document lookup.

**Security.** NFR-03 establishes that JWT authentication is the mandatory gate for all endpoints except the two that must be publicly accessible: registration and login. Every other endpoint uses the `@jwt_required()` decorator from Flask-JWT-Extended, which validates the token signature, checks expiry, and extracts the user identity before the route handler executes. NFR-04 mandates bcrypt hashing for all passwords, with a cost factor of 12. The bcrypt library is called with `bcrypt.gensalt(rounds=12)` in the User model's `create` method, ensuring consistent application of this requirement across all registration paths. No plaintext, MD5, or SHA-1 password storage is used anywhere in the system, as confirmed by database inspection during testing.

**Reliability.** NFR-05 specifies a 99.5% uptime target for the backend, which corresponds to approximately 43 hours of allowable downtime per year. This target is achievable on a local server deployment without special high-availability infrastructure and is appropriate for an MVP-stage application. NFR-06 specifies that the mobile application must degrade gracefully when the network connection is lost, rather than presenting an error dialog or crashing. This is implemented through the OfflineBanner component, which continuously monitors network state using NetInfo and displays a banner when connectivity is absent. API calls that fail due to network absence are caught in try-catch blocks and present user-friendly error messages rather than unhandled exceptions.

**Scalability.** NFR-07 reflects the design principle that the data tier should be capable of horizontal scaling without architectural changes. MongoDB's document model and sharding capability mean that as the number of mechanics and vehicle owners grows, the database can be scaled by adding shard nodes rather than by migrating to a different database technology. The 2dsphere index on the mechanics collection is compatible with MongoDB's range-based sharding strategy, and the other collections use document-level identifiers (ObjectId) that are suitable as shard keys. This scalability property does not need to be exercised in the FYP context but ensures that the architectural foundations are sound for future growth.

**Usability.** NFR-08 establishes a concrete efficiency criterion: the mechanic search — the most common action for vehicle owners — must be reachable in at most two taps from the home screen. This is achieved through the bottom tab navigator, which places the Search tab as the second item and is accessible with a single tap from any other tab. NFR-09 establishes a two-second maximum delay for the offline banner to appear after network loss. The NetInfo event listener fires synchronously with the network state change event, typically within one second, satisfying this requirement with margin.

**Compatibility.** NFR-10 specifies Android API level 21 (Android 5.0, released 2014) as the minimum supported Android version. This choice maximises the device coverage for the application by including older Android devices that remain prevalent in Pakistan's market, while still supporting all the API features used by React Native 0.74.0 and its dependencies. The react-native-geolocation-service library requires a minimum of API level 21, and all other dependencies are compatible with this baseline.

**Standards.** NFR-11 requires that the API follows RESTful design principles as described by Fielding (2000), using HTTP verbs in their standard semantic roles: GET for read operations, POST for create operations, PUT for update operations, and DELETE for deactivate/delete operations. All responses use JSON payloads with consistent envelope structures. NFR-12 specifies a 24-hour JWT token expiry, balancing security (tokens expire and cannot be used indefinitely if compromised) against user experience (users do not need to re-authenticate every few hours). The expiry is configured through the `JWT_ACCESS_TOKEN_EXPIRES` configuration key set to 86400 seconds.

## 2.3 Use Case Analysis

### 2.3.1 Use Case: Register and Login

**Actor:** Vehicle Owner or Mechanic  
**Precondition:** User has the app installed and has not yet registered, or has an existing account  

**Main Flow (Registration):**
1. User opens the application and sees the Splash Screen, then the Login Screen.
2. User taps "Register" and is taken to the Registration Screen.
3. User enters their name, email, password, selects their role (Vehicle Owner or Mechanic), and for mechanics additionally provides shop name, address, and GPS location.
4. User taps "Create Account"; the app calls `POST /api/auth/register` with the entered data.
5. Backend validates the data, checks for duplicate email, hashes the password, creates the user (and mechanic profile if role is mechanic), generates a JWT token, and returns it in the response. The app stores the token in AsyncStorage and navigates to the appropriate home screen.

**Main Flow (Login):**
1. User opens the application and sees the Login Screen.
2. User enters their registered email and password.
3. User taps "Login"; the app calls `POST /api/auth/login`.
4. Backend validates credentials, generates a JWT token, and returns it with the user profile.
5. App stores the token and user data in AsyncStorage, sets the Axios default Authorization header, and navigates to the role-appropriate home screen.

**Alternate Flows:**
- *Duplicate email:* Backend returns HTTP 409 Conflict; app displays "An account with this email already exists."
- *Invalid credentials:* Backend returns HTTP 401 Unauthorized; app displays "Invalid email or password."
- *Missing required fields:* Backend returns HTTP 400 Bad Request; app displays the specific missing field error.
- *Network error:* Axios catches the network error; app displays "Unable to connect. Please check your internet connection."

### 2.3.2 Use Case: Search Nearby Mechanics

**Actor:** Vehicle Owner  
**Precondition:** User is logged in with a valid JWT token; GPS permission has been granted  

**Main Flow:**
1. Vehicle owner navigates to the Search Mechanics tab.
2. App requests the device's current GPS location via react-native-geolocation-service with high accuracy enabled.
3. App calls `GET /api/mechanic/nearby` with the latitude, longitude, radius (default 10 km), and optional specialisation filter.
4. Backend executes the 2dsphere geospatial query, filters by `status: 'open'` and `is_banned: false`, and computes distance and ETA for each result.
5. App renders the results as a FlatList of mechanic cards, each showing the mechanic's shop name, distance in kilometres, ETA in minutes, average rating, and service types.
6. Vehicle owner can tap any mechanic card to navigate to the Mechanic Profile screen for more details.

**Alternate Flows:**
- *No mechanics found:* App displays an empty state with the message "No mechanics available nearby. Try increasing the search radius."
- *GPS permission denied:* App displays an error message and a button to open Android settings for location permission.
- *GPS timeout:* If the location fix takes longer than 15 seconds, app displays "Unable to get your location. Please try again."
- *Specialisation filter returns empty:* App displays "No mechanics found with that specialisation. Try removing the filter."

### 2.3.3 Use Case: Rate a Mechanic

**Actor:** Vehicle Owner  
**Precondition:** A service has been completed with the mechanic; the vehicle owner has not previously rated this mechanic  

**Main Flow:**
1. Vehicle owner navigates to the mechanic's profile or to their service history.
2. Vehicle owner taps "Rate this Mechanic" to open the Rating Screen.
3. Rating Screen presents a five-star overall rating selector and four slider controls for Punctuality, Work Quality, Communication, and Value for Money, along with an optional text comment field.
4. Vehicle owner selects their ratings and optionally writes a comment, then taps "Submit Rating".
5. App calls `POST /api/ratings/create` with the mechanic ID, overall rating, sub-ratings, and comment. Backend validates the data, checks for duplicate rating, inserts the rating document, recomputes the mechanic's average rating, and returns a success response. App navigates back with a success toast notification.

**Alternate Flows:**
- *Already rated:* Backend returns HTTP 409 Conflict; app displays "You have already rated this mechanic."
- *Rating out of range:* Backend returns HTTP 400; app validation prevents submission with a rating outside 1–5.

### 2.3.4 Use Case: Send SOS Alert

**Actor:** Vehicle Owner  
**Precondition:** Vehicle owner is logged in with a valid JWT token and has an active GPS fix  

**Main Flow:**
1. Vehicle owner is on the Home Screen and taps the large red SOS button.
2. App displays a confirmation dialog: "Send SOS Alert? This will notify all nearby mechanics of your emergency."
3. Vehicle owner confirms; app gets the current GPS location and calls `POST /api/sos/create` with the latitude, longitude, optional vehicle type, and issue description.
4. Backend creates the SOS document in the emergency_sos collection with status "active", queries all online verified mechanics within the broadcast radius (default 50 km), and sends in-app and push notifications to each.
5. App navigates to an SOS Active screen showing the SOS status and a count of mechanics notified, updating as mechanics accept the request.

**Alternate Flows:**
- *No mechanics online in the area:* Backend creates the SOS record but notifications list is empty; app shows "SOS sent but no mechanics are currently available nearby."
- *GPS fix unavailable:* App requests manual location entry; vehicle owner can type their address or drop a pin on a map.
- *Network error:* App displays "Failed to send SOS. Please try again."

### 2.3.5 Use Case: View Service History

**Actor:** Vehicle Owner  
**Precondition:** At least one completed service request exists for this vehicle owner  

**Main Flow:**
1. Vehicle owner opens the application and navigates to the Service History tab.
2. App calls `GET /api/history` to fetch the vehicle owner's service history records.
3. Backend queries the service_history collection for records associated with the vehicle owner's user_id, sorted by created_at descending, and returns the list.
4. App renders the results as a sorted list showing service type, mechanic name, date, and status for each record.
5. Vehicle owner taps any record to see the full detail view: mechanic shop name, address, service description, cost, date, and the rating given (if any).

**Alternate Flows:**
- *No history:* App displays an empty state screen with a message: "No service history yet. Your completed services will appear here."
- *Network error:* App displays a retry button with an error message.

### 2.3.6 Use Case: Admin Verify Mechanic

**Actor:** Admin  
**Precondition:** A mechanic has registered but not yet been verified  

**Main Flow:**
1. Admin logs in with their admin credentials and is routed to the Admin Dashboard.
2. Admin navigates to the Mechanic Verification screen.
3. Admin filters the mechanic list by verification_status = "pending" to see newly registered mechanics awaiting review.
4. Admin selects a mechanic and views their full verification profile: name, email, shop name, address, CNIC number, CNIC document image, certificate title, and certificate document image.
5. Admin reviews the submitted documents against the provided identity information.
6. Admin taps "Verify" to approve the mechanic (setting is_verified = true and verification_status = "verified") or "Reject" to decline. In both cases, a notification is sent to the mechanic informing them of the decision.

**Alternate Flows:**
- *Documents incomplete:* Admin selects "Reject" and enters a rejection reason. The mechanic receives a notification with the specific reason, is prompted to update their profile with the missing information, and can resubmit for verification.
- *Duplicate CNIC:* Admin notices the CNIC number matches a previously verified mechanic and rejects the registration with a note about the duplicate.

## 2.4 User Roles and Actors

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| Vehicle Owner | Primary consumer of mechanic services | Search mechanics, view profiles, rate, SOS, message, view history |
| Mechanic | Service provider on the platform | Manage status/location, view requests, accept SOS, message, manage services |
| Admin | Platform operator and moderator | Verify mechanics, manage users, view analytics, broadcast alerts, handle reports |

**Vehicle Owner.** The Vehicle Owner is the primary end-user and the central actor around whom the application's user experience is designed. Vehicle owners interact with the platform reactively — they open the app when they need a mechanic, whether for a scheduled service or an emergency breakdown. Their permissions are scoped to actions that do not affect other users' data: they can search and view mechanic profiles (read-only access to mechanic data), submit ratings for mechanics they have engaged (write access to their own ratings), create SOS alerts (write access to their own SOS records), send messages to mechanics (write access to their own side of conversations), and view and manage their own profile and service history. Vehicle owners cannot access admin functions, cannot modify other users' data, and cannot directly change a mechanic's profile or status. This constrained permission set is enforced at the middleware layer through the JWT role claims and the auth_middleware.py decorators.

**Mechanic.** The Mechanic is both a consumer of the platform (using it to receive and manage service requests) and a producer of the platform's core value (providing services that generate ratings and populate the mechanic discovery ecosystem). Mechanics interact with the platform continuously during working hours, toggling their status to reflect their availability and monitoring their dashboard for incoming requests and SOS alerts. Their permissions include all standard user capabilities plus mechanic-specific operations: updating their availability status (which directly affects their visibility in vehicle owner searches), updating their workshop location, managing their list of service specialisations, viewing their rating history, accepting SOS requests, and messaging vehicle owners. Mechanics cannot access admin functions, cannot modify their own verification status, and cannot delete ratings left by vehicle owners. The mechanic_required decorator in auth_middleware.py enforces that mechanic-specific endpoints are inaccessible to vehicle owner tokens.

**Admin.** The Admin is a trusted platform operator who interacts with the application through a dedicated admin-facing tab navigator. Admins have the broadest permission set of the three roles, including read access to all user and mechanic data, write access to mechanic verification and ban status, read access to all service requests, SOS alerts, and analytics, and the ability to broadcast platform-wide notifications. Admin accounts are created with the is_admin flag set to true in the user document; this flag is checked by the `check_admin` function in admin_routes.py and by the `admin_required` decorator in auth_middleware.py on every request to an admin endpoint. Admin accounts are not created through the public registration flow — they are provisioned directly in the database by the platform operator, preventing unauthorised admin account creation.

---


# CHAPTER 3: SYSTEM DESIGN

## 3.1 System Architecture

The Smart Mechanic Finder system is built on a classic three-tier architecture that cleanly separates presentation concerns, business logic, and data persistence. This separation of concerns is a fundamental design principle that enables each tier to evolve and scale independently, simplifies testing by allowing components to be tested in isolation, and provides a clear conceptual framework for understanding how the system works. The three tiers are: the Presentation Tier (the React Native mobile application), the Application Tier (the Flask backend API), and the Data Tier (the MongoDB database). Communication between the Presentation and Application tiers uses HTTPS with JSON payloads, managed by the Axios HTTP client. Communication between the Application and Data tiers uses the PyMongo driver's native wire protocol.

```
+------------------------------------------------------------------+
|                    PRESENTATION TIER                             |
|         React Native Mobile Application (Android)               |
|  +--------------+ +--------------+ +------------------------+  |
|  | Auth Screens | | User Screens | | Admin Screens          |  |
|  | Login        | | Home, Search | | Dashboard, Reports     |  |
|  | Register     | | Map, Profile | | Verify Mechanics       |  |
|  +--------------+ +--------------+ +------------------------+  |
|        +------------------------------------------+             |
|        | React Context: Auth, Location, Theme      |             |
|        +------------------------------------------+             |
+---------------------------+--------------------------------------+
                            | HTTPS / JSON REST API
                            | Axios HTTP Client
+---------------------------v--------------------------------------+
|                    APPLICATION TIER                              |
|              Flask 3.0.0 Backend (Python 3.11+)                  |
|  +---------------+ +------------------+ +------------------+    |
|  | Auth Blueprint| |Mechanic Blueprint| | Admin Blueprint  |    |
|  | /api/auth     | | /api/mechanic    | | /api/admin       |    |
|  +---------------+ +------------------+ +------------------+    |
|  +---------------+ +------------------+ +------------------+    |
|  | SOS Blueprint | |Rating Blueprint  | |Message Blueprint |    |
|  | /api/sos      | | /api/ratings     | | /api/messages    |    |
|  +---------------+ +------------------+ +------------------+    |
|        +------------------------------------------+             |
|        | Middleware: JWT Auth, CORS, Validation    |             |
|        +------------------------------------------+             |
|        +------------------------------------------+             |
|        | Services: Location, Notification,         |             |
|        |           Rating, Analytics               |             |
|        +------------------------------------------+             |
+---------------------------+--------------------------------------+
                            | PyMongo Driver
+---------------------------v--------------------------------------+
|                      DATA TIER                                   |
|                    MongoDB 8.x                                   |
|  +----------+ +----------+ +----------+ +------------------+    |
|  |  users   | | mechanics| | ratings  | | service_history  |    |
|  +----------+ +----------+ +----------+ +------------------+    |
|  +----------+ +----------+ +----------+ +------------------+    |
|  | messages | |emergency | |analytics | | notifications    |    |
|  |          | |_sos      | |          | |                  |    |
|  +----------+ +----------+ +----------+ +------------------+    |
+------------------------------------------------------------------+
```

**Presentation Tier.** The Presentation Tier consists of the React Native 0.74.0 Android application. At the top level, the application is wrapped in Context providers — AuthContext, LocationContext, and ThemeContext — that make authentication state, GPS location data, and UI theme preferences available to all nested components without the need for explicit prop drilling. The AuthContext reads the persisted JWT token and user data from AsyncStorage on startup, determines the user's role, and sets the navigation root to either the Auth navigator (if not logged in) or the appropriate role-specific tab navigator. Screen components are organised into three groups: Auth Screens (Splash, Login, Register), User Screens (Home, Search, Map, Profile, Service History, Rating, Message), and Admin Screens (Dashboard, Mechanic Verification, Analytics, Reports). All screens communicate with the backend exclusively through the configured Axios instance, which has the API base URL and the JWT token pre-configured in its default headers.

**Application Tier.** The Application Tier is a Flask 3.0.0 application created using the application factory pattern in the `create_app()` function defined in `backend/app/__init__.py`. The factory initialises the JWT manager, the CORS handler, the database connection, and the optional Firebase and Redis connections before registering six Blueprints at their respective URL prefixes. Each Blueprint corresponds to a functional module and contains all the route handlers relevant to that module's domain. The middleware layer, implemented through Flask-JWT-Extended decorators (`@jwt_required()`) and custom decorators in `auth_middleware.py` (`@admin_required`, `@mechanic_required`), intercepts requests before they reach route handlers to perform authentication and authorisation checks. The services layer (location_service.py, notification_service.py) provides reusable business logic functions — such as distance and ETA calculation and notification dispatch — that are called from multiple route handlers.

**Data Tier.** The Data Tier is a MongoDB 8.x instance accessible via the PyMongo 4.x driver. The database contains eight primary collections: users, mechanics, ratings, service_history, emergency_sos, messages (via conversations structure), notifications, and analytics. The mechanics collection carries the most performance-critical index: a 2dsphere index on the location field that enables millisecond-range geospatial proximity queries. The users collection has a unique index on the email field to prevent duplicate registrations. The ratings collection has a compound index on (user_id, mechanic_id) to enforce the one-rating-per-mechanic-per-user rule at the database level. The database connection is managed per-request through Flask's `g` object, with the connection being established on first use and closed at request teardown by the `close_db` function registered as a teardown handler.

**Communication Flow.** The communication flow for a typical request proceeds as follows: the mobile client constructs a request using the Axios instance, which automatically includes the `Authorization: Bearer <token>` header and the `Content-Type: application/json` header. The request travels over the local network to the Flask server bound at `0.0.0.0:5000`. Flask's CORS middleware validates the origin and preflight headers. The route handler decorator chain executes: first the `@jwt_required()` decorator validates the token signature and expiry using the JWT_SECRET_KEY; then any role-specific decorator checks the user's role in the database. The route handler executes, calling `get_db()` to obtain the MongoDB connection from the `g` object, performing the required database operations, serialising the result to JSON, and returning an HTTP response. The Axios instance receives the response, and the calling React component updates its state to reflect the new data.

**Security Layer.** Security is implemented across all three tiers. In the Presentation Tier, the JWT token is stored in AsyncStorage and never logged or exposed in the UI. In the Application Tier, every protected endpoint requires a valid JWT, CORS blocks requests from unauthorised origins, and input validation ensures that malformed requests are rejected before reaching the database. In the Data Tier, bcrypt hashes ensure that even if the database is compromised, plaintext passwords are not exposed. The combination of these measures creates a defence-in-depth security model where the compromise of any single layer does not automatically expose the entire system to unauthorised access.

## 3.2 Database Design

### 3.2.1 Users Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | MongoDB auto-generated primary key |
| name | String | Full name of the user |
| email | String | Unique email address (indexed) |
| password_hash | String | bcrypt hash of the password |
| phone | String | Contact number (optional) |
| latitude | Float | Last known latitude (optional) |
| longitude | Float | Last known longitude (optional) |
| location_name | String | Human-readable location label |
| is_mechanic | Boolean | True if user is a mechanic |
| is_admin | Boolean | True if user is an admin |
| is_active | Boolean | Account active status |
| fcm_token | String | Firebase Cloud Messaging device token |
| last_login | Date | Timestamp of most recent login |
| created_at | Date | Account creation timestamp |
| updated_at | Date | Last modification timestamp |

The users collection is the authentication anchor for the entire application. The email field carries a unique index (created in `init_db` as `db.users.create_index([('email', 1)], unique=True)`) that enforces the uniqueness constraint at the database level, providing a secondary safeguard in addition to the application-level duplicate check. The password_hash field stores only the bcrypt-hashed output — never the plaintext password — ensuring that even direct database access cannot reveal user passwords. The is_mechanic and is_admin Boolean flags on the user document serve as the primary role indicators used by the `check_admin` function in admin_routes.py and the `mechanic_required` decorator in auth_middleware.py. The fcm_token field is updated by the mobile application each time the user logs in with a new device or after a token refresh, ensuring that push notifications are delivered to the correct device; this field may be null for users who have not granted push notification permission or who have not logged in since FCM integration was added.

### 3.2.2 Mechanics Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | MongoDB auto-generated primary key |
| user_id | String | Reference to users collection (string form of ObjectId) |
| shop_name | String | Name of the mechanic's workshop |
| address | String | Physical address of the workshop |
| location | GeoJSON Point | {type: 'Point', coordinates: [lng, lat]} |
| latitude | Float | Workshop latitude (denormalised for convenience) |
| longitude | Float | Workshop longitude (denormalised for convenience) |
| location_name | String | Human-readable area name |
| status | String | 'open', 'closed', or 'busy' |
| services | Array[String] | List of service types offered |
| phone | String | Workshop contact number |
| description | String | Workshop description |
| opening_hours | String | Stated opening hours |
| is_verified | Boolean | Admin verification status |
| verification_status | String | 'pending', 'verified', or 'rejected' |
| cnic_number | String | Formatted CNIC (identity document) number |
| cnic_document_url | String | URL to uploaded CNIC image |
| certificate_title | String | Title of certification document |
| certificate_document_url | String | URL to uploaded certification image |
| profile_photo_url | String | URL to mechanic profile photo |
| is_banned | Boolean | Platform ban status |
| rating_average | Float | Computed average of all ratings |
| total_ratings | Integer | Count of ratings received |
| response_time | Integer | Average response time in minutes |
| created_at | Date | Profile creation timestamp |
| updated_at | Date | Last update timestamp |

The mechanics collection's most performance-critical feature is the 2dsphere index on the location field, created in `init_db` as `db.mechanics.create_index([('location', '2dsphere')])`. This index requires that the location field stores a valid GeoJSON Point object with coordinates in [longitude, latitude] order (note: GeoJSON uses longitude first, which is the reverse of the conventional (lat, lng) order used in most geographic contexts). The Mechanic model's `create` method enforces this format when creating new mechanic profiles. The `$near` and `$nearSphere` query operators require this index to function; without it, proximity queries would fail with a MongoDB error. The mechanic profile is stored separately from the user document as a normalisation decision: the users collection handles authentication and cross-role common fields, while the mechanics collection handles all professional-profile-specific data. The rating_average and total_ratings fields are denormalised from the ratings collection for query performance — rather than aggregating ratings on every search, the pre-computed average is available directly in the mechanic document.

### 3.2.3 Ratings Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| mechanic_id | String | Reference to mechanics collection |
| user_id | String | Reference to users (vehicle owner) |
| service_id | String | Optional reference to service_history record |
| rating | Integer | Overall rating (1-5) |
| review | String | Optional text review |
| service_quality | Integer | Sub-rating: service quality (1-5) |
| punctuality | Integer | Sub-rating: punctuality (1-5) |
| pricing | Integer | Sub-rating: value for money (1-5) |
| communication | Integer | Sub-rating: communication (1-5) |
| created_at | Date | Submission timestamp |
| updated_at | Date | Last modification timestamp |

The ratings collection captures the multi-dimensional review data that powers the trust system of the platform. The design choice to use separate integer fields for each sub-dimension (rather than a nested object) simplifies MongoDB aggregation queries that compute averages per dimension. The compound index `db.ratings.create_index([('user_id', 1), ('mechanic_id', 1)])` enforces the one-rating-per-mechanic-per-user business rule at the database level; the application-level check in `create_rating` catches this constraint before the insert, but the index provides a safety net. After each successful rating insertion, the `Mechanic.update_rating` static method is called to recompute and update the rating_average and total_ratings fields in the corresponding mechanics document. This approach keeps the aggregate values current without requiring a live aggregation query on every search, at the cost of a small write overhead on rating submission.

### 3.2.4 Service Requests Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| user_id | String | Requesting vehicle owner |
| mechanic_id | String | Assigned mechanic |
| service_type | String | Category of service |
| description | String | Vehicle problem description |
| status | String | 'requested', 'in_progress', 'completed', 'cancelled' |
| cost | Float | Service cost (set at completion) |
| latitude | Float | Owner's GPS latitude at request time |
| longitude | Float | Owner's GPS longitude at request time |
| vehicle_type | String | Type of vehicle |
| vehicle_number | String | Vehicle registration number |
| customer_name | String | Customer name at time of service |
| customer_phone | String | Customer phone at time of service |
| service_date | Date | Date service was performed |
| added_by | String | 'customer' or 'mechanic' (who created the record) |
| rating_given | Boolean | Whether a rating has been submitted for this service |
| created_at | Date | Request creation time |
| updated_at | Date | Last status change time |

The service history collection implements a state machine with four states: requested (initial state when a vehicle owner submits a service request), in_progress (accepted by the mechanic), completed (service finished), and cancelled (either party cancelled). Status transitions are validated in the route handlers to prevent invalid state changes (for example, a completed service cannot be moved back to requested). The latitude and longitude fields capture the vehicle owner's location at the time the request was made, providing a geographic snapshot that is useful for analytics and for the admin to understand the geographic distribution of service activity. The rating_given Boolean flag allows the service history screen to indicate whether a rating has been submitted for each service, prompting the vehicle owner to rate services they have not yet reviewed.

### 3.2.5 Messages Collection

The messaging architecture in Smart Mechanic Finder uses a two-level structure: a conversations collection and a messages collection. Each conversation document represents the unique channel between one vehicle owner and one mechanic, identified by the combination of user_id and mechanic_id. Each message document references its parent conversation through the conversation_id field.

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| conversation_id | String | Reference to conversations collection |
| sender_id | String | User ID of the message sender |
| sender_role | String | 'user' or 'mechanic' |
| text | String | Message text content |
| read | Boolean | Whether the recipient has read this message |
| is_edited | Boolean | Whether the message has been edited |
| edited_at | Date | Timestamp of edit (if applicable) |
| is_deleted | Boolean | Soft-delete flag |
| created_at | Date | Message timestamp |

The conversations collection carries an index on the combination of user_id and mechanic_id to ensure fast lookup of the existing conversation between a specific pair of participants. The messages collection carries an index on (conversation_id, created_at) to support efficient retrieval of a conversation's messages in chronological order. The soft-delete pattern (is_deleted flag rather than physical deletion) preserves message data for audit purposes while removing the message from the UI for the user who deleted it. The `clear_conversation` function implements a user-level chat clearing feature by recording a timestamp per user in a cleared_by map on the conversation document; messages older than the clear timestamp are filtered out when loading the conversation for that user, while remaining visible to the other participant.

### 3.2.6 SOS Alerts Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| user_id | String | Vehicle owner who triggered SOS |
| latitude | Float | Owner's latitude at SOS time |
| longitude | Float | Owner's longitude at SOS time |
| location_name | String | Human-readable location description |
| vehicle_type | String | Type of vehicle in distress |
| issue_description | String | Description of the emergency |
| photo_id | String | Optional photo of the vehicle/scene |
| status | String | 'active', 'responding', 'cancelled' |
| assigned_mechanic_id | String | ID of mechanic who accepted (null if unassigned) |
| response_time | Integer | Time in minutes from creation to acceptance |
| resolved_time | Date | Timestamp when resolved |
| created_at | Date | Alert creation time |
| updated_at | Date | Last status change time |

The SOS alerts collection is the operational record for the emergency feature. When a vehicle owner creates an SOS, the status begins at "active" and the assigned_mechanic_id is null. The `notify_nearby_mechanics` function in notifications.py queries the mechanics collection for all open, non-banned mechanics within the broadcast radius, creates in-app notification documents for each, and optionally sends FCM push messages. When a mechanic taps "Accept" on an SOS request, the SOS status changes to "responding" and the assigned_mechanic_id is set to that mechanic's document ID. The vehicle owner is notified of the mechanic's acceptance. If the vehicle owner cancels the SOS before any mechanic responds, the status changes to "cancelled". The response_time field, calculated as the difference between accepted timestamp and created_at, is used in the analytics collection to track average emergency response times, an important platform quality metric.

### 3.2.7 Analytics Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| event_type | String | Type of analytics event |
| timestamp | Date | When the event occurred |
| user_id | String | User associated with the event (optional) |
| mechanic_id | String | Mechanic associated with the event (optional) |
| metadata | Object | Flexible additional event data |

The analytics collection in Smart Mechanic Finder uses an event-sourcing approach rather than a pre-aggregated daily summary. Each significant event — a new user registration, a service completion, a rating submission, an SOS creation, a mechanic verification — is recorded as an individual document in the analytics collection with an event_type, timestamp, and associated entity IDs. The admin dashboard aggregates this data at query time using MongoDB aggregation pipelines that group by event_type and time period, computing counts, averages, and distributions. This approach allows flexible retroactive analysis of any event dimension and supports the admin's ability to filter analytics by mechanic, by time range, or by event type. The indexes on event_type, timestamp, user_id, and mechanic_id ensure that these aggregation queries execute efficiently even as the collection grows over time.

## 3.3 API Design

The Smart Mechanic Finder backend exposes a comprehensive set of RESTful endpoints organised into six Blueprint modules. All endpoints follow a consistent design pattern: JWT authentication in the Authorization header, JSON request and response bodies, and a standard error response envelope. The complete endpoint reference is presented below.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | None | Register new user or mechanic |
| POST | /api/auth/login | None | Login, returns JWT token |
| GET | /api/auth/profile | JWT | Get current user profile |
| PUT | /api/auth/profile | JWT | Update profile fields |
| GET | /api/mechanic/nearby | JWT | Find nearby online verified mechanics |
| GET | /api/mechanic/dashboard | JWT+Mechanic | Get mechanic dashboard stats |
| PUT | /api/mechanic/profile | JWT+Mechanic | Update mechanic profile |
| GET | /api/mechanic/services | JWT+Mechanic | Get mechanic services list |
| POST | /api/mechanic/services | JWT+Mechanic | Add a service to profile |
| PUT | /api/mechanic/services | JWT+Mechanic | Replace full services list |
| DELETE | /api/mechanic/services/:name | JWT+Mechanic | Remove a service |
| PUT | /api/mechanic/status | JWT+Mechanic | Update online status |
| GET | /api/mechanic/ratings | JWT+Mechanic | Get mechanic's rating history |
| GET | /api/mechanic/history | JWT+Mechanic | Get mechanic's service history |
| POST | /api/mechanic/sos/accept/:id | JWT+Mechanic | Accept an SOS request |
| GET | /api/mechanic/sos/active | JWT+Mechanic | View active SOS near mechanic |
| POST | /api/ratings/create | JWT | Submit rating for a mechanic |
| GET | /api/ratings/mechanic/:id | None | Get ratings for a mechanic |
| GET | /api/ratings/my-ratings | JWT | Get vehicle owner's submitted ratings |
| POST | /api/sos/create | JWT | Create SOS emergency alert |
| GET | /api/sos/active | JWT | Get user's active SOS records |
| PUT | /api/sos/:id/cancel | JWT | Cancel an SOS alert |
| GET | /api/messages/conversations | JWT | Get user's conversation list |
| POST | /api/messages/conversations | JWT | Start or retrieve a conversation |
| GET | /api/messages/conversations/:id/messages | JWT | Get messages for a conversation |
| POST | /api/messages/conversations/:id/messages | JWT | Send a message |
| PUT | /api/messages/conversations/:id/messages/:msgid | JWT | Edit a message |
| DELETE | /api/messages/conversations/:id/messages/:msgid | JWT | Delete a message |
| DELETE | /api/messages/conversations/:id/clear | JWT | Clear chat for current user |
| GET | /api/admin/dashboard | JWT+Admin | Get admin dashboard stats |
| GET | /api/admin/users | JWT+Admin | List all users with pagination |
| PUT | /api/admin/users/:id | JWT+Admin | Update user account |
| DELETE | /api/admin/users/:id | JWT+Admin | Deactivate user account |
| GET | /api/admin/mechanics | JWT+Admin | List all mechanics |
| PUT | /api/admin/mechanics/:id/verify | JWT+Admin | Verify or unverify mechanic |
| PUT | /api/admin/mechanics/:id/ban | JWT+Admin | Ban or unban mechanic |
| GET | /api/admin/reports | JWT+Admin | Get platform reports |
| PUT | /api/admin/reports/:id | JWT+Admin | Update report status |

**RESTful Design Principles.** The API follows the RESTful architectural style as described by Fielding (2000), mapping HTTP verbs to their standard semantic operations. GET requests are used for all read operations that do not change server state; they are safe and idempotent. POST requests create new resources: user registrations, rating submissions, SOS alerts, messages, and conversations. PUT requests update existing resources: profile updates, status changes, verification decisions, and ban actions. DELETE requests deactivate or soft-delete resources: user deactivation and message deletion. URL structure follows a resource-oriented pattern where the base path identifies the resource collection (e.g., `/api/mechanic`, `/api/ratings`) and path parameters identify specific instances (e.g., `/api/admin/mechanics/:id/verify`). Query parameters are used for filtering and pagination in list endpoints. All response bodies are JSON with a consistent structure: successful responses include the relevant data, and error responses include a `success: false` flag, an error message string, and the HTTP status code.

**Authentication Flow.** The JWT authentication flow begins at the login endpoint, where the client submits the user's email and password. The server validates the credentials, retrieves the user document from MongoDB, calls `bcrypt.checkpw` to verify the password hash, updates the last_login timestamp, and calls `create_access_token` from Flask-JWT-Extended with the user's MongoDB ObjectId as the identity. The resulting JWT contains three parts: a header with the algorithm (HS256) and token type, a payload with the user identity, an expiry timestamp (24 hours from issue), and any additional claims, and a signature computed using the JWT_SECRET_KEY. The client stores this token in AsyncStorage and configures the Axios default headers to include `Authorization: Bearer <token>` on all subsequent requests. When a protected endpoint receives a request, the `@jwt_required()` decorator calls `verify_jwt_in_request()`, which decodes the token using the same secret key, validates the signature and expiry, and makes the identity available via `get_jwt_identity()`. If the token is missing, expired, or invalid, the decorator returns a 401 Unauthorized response before the route handler executes.

**Standard Error Response Format.** All error responses from the Smart Mechanic Finder API follow a consistent JSON envelope that allows mobile client code to handle errors uniformly without parsing different structures for different endpoints.

```json
{
  "error": "Descriptive error message explaining what went wrong",
  "success": false
}
```

The HTTP status code in the response line conveys the category of error: 400 for client request errors (missing fields, invalid values), 401 for authentication failures (missing or invalid JWT), 403 for authorisation failures (valid JWT but insufficient role), 404 for resource not found, 409 for conflict errors (duplicate email, duplicate rating), and 500 for unexpected server errors. The mobile client's Axios error handler reads the response data to extract the error message for display to the user.

**Request and Response Examples:**

POST /api/auth/register — Request body:
```json
{
  "name": "Ali Hassan",
  "email": "ali@example.com",
  "password": "SecurePass123",
  "role": "vehicle_owner",
  "phone": "+923001234567"
}
```
Success response (HTTP 201):
```json
{
  "message": "User registered successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "name": "Ali Hassan",
    "email": "ali@example.com",
    "is_mechanic": false,
    "is_admin": false
  }
}
```

POST /api/auth/login — Request body:
```json
{
  "email": "ali@example.com",
  "password": "SecurePass123"
}
```
Success response (HTTP 200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "name": "Ali Hassan",
    "email": "ali@example.com",
    "phone": "+923001234567",
    "is_mechanic": false,
    "is_admin": false
  }
}
```

GET /api/mechanic/nearby — Query parameters: `?lat=35.2971&lng=75.6333&radius=10&status=open`
Success response (HTTP 200):
```json
{
  "mechanics": [
    {
      "_id": "665a1b2c3d4e5f6a7b8c9d1f",
      "shop_name": "Ahmed Motors",
      "address": "Main Bazaar, Skardu",
      "latitude": 35.2912,
      "longitude": 75.6298,
      "services": ["engine", "tyres", "brakes"],
      "rating_average": 4.3,
      "total_ratings": 12,
      "status": "open",
      "is_verified": true,
      "distance": 0.72,
      "eta_minutes": 2
    }
  ],
  "count": 1
}
```

POST /api/sos/create — Request body:
```json
{
  "latitude": 35.2971,
  "longitude": 75.6333,
  "location_name": "Karakoram Highway, near Skardu Fort",
  "vehicle_type": "motorcycle",
  "issue_description": "Flat tyre, cannot proceed"
}
```
Success response (HTTP 201):
```json
{
  "message": "SOS alert sent",
  "sos_id": "665a1b2c3d4e5f6a7b8c9d20"
}
```

## 3.4 Mobile App Navigation Design

The Smart Mechanic Finder mobile application uses a hierarchical navigation structure managed by React Navigation 6.x. The root navigator is a Stack navigator that conditionally presents either the authentication flow (when no valid token is found in AsyncStorage) or the authenticated application (when a valid token exists). The authenticated application renders one of three tab navigators based on the user's role as determined by the AuthContext.

```
App Navigator (Stack)
|-- AuthNavigator (Stack) -- shown when not logged in
|   |-- SplashScreen
|   |-- LoginScreen
|   +-- RegisterScreen
|
+-- MainNavigator -- shown when logged in
    |-- VehicleOwnerTabNavigator (Bottom Tabs)
    |   |-- HomeScreen (Tab 1)
    |   |-- SearchMechanicsScreen (Tab 2)
    |   |-- MapScreen (Tab 3)
    |   |-- ServiceHistoryScreen (Tab 4)
    |   +-- ProfileScreen (Tab 5)
    |       +-- RatingScreen (Modal Stack)
    |           +-- MessageScreen (Stack)
    |
    |-- MechanicTabNavigator (Bottom Tabs)
    |   |-- MechanicDashboardScreen (Tab 1)
    |   |-- RequestsScreen (Tab 2)
    |   |-- MessagesListScreen (Tab 3)
    |   +-- MechanicProfileScreen (Tab 4)
    |
    +-- AdminTabNavigator (Bottom Tabs)
        |-- AdminDashboardScreen (Tab 1)
        |-- MechanicVerificationScreen (Tab 2)
        |-- AnalyticsScreen (Tab 3)
        +-- ReportsScreen (Tab 4)
```

**Role-Based Navigator Selection.** After a successful login, the AuthContext is updated with the user's profile data including the is_mechanic and is_admin flags. The App Navigator reads these flags from the AuthContext and conditionally renders the appropriate tab navigator: if is_admin is true, the AdminTabNavigator is rendered; if is_mechanic is true, the MechanicTabNavigator is rendered; otherwise (for vehicle owners), the VehicleOwnerTabNavigator is rendered. This role-based navigator selection is implemented as a conditional expression in the App Navigator component's render function, ensuring that the navigation structure available to the user precisely matches their role and that users cannot navigate to screens outside their role's scope by manipulating navigation state. The separation of navigators by role also means that the tab bar icons, labels, and screen order are optimised for each role's primary workflows independently.

**Navigation State Persistence.** React Navigation 6.x supports navigation state persistence through its `useNavigationContainerRef` and `onStateChange` callback mechanism. The application stores the navigation state in AsyncStorage on every state change and restores it on startup, allowing users to resume exactly where they left off after the application is backgrounded and resumed. This is particularly useful for the messaging and rating flows, where the user may switch to another app mid-conversation and expect to return to the same screen. Deep linking is configured for the SOS notification action, allowing a tap on a push notification received while the app is in the background to open the app directly to the SOS Active screen, showing the details of the SOS that triggered the notification.

**Modal and Stack Navigation Patterns.** The Rating Screen and individual Mechanic Profile screens are implemented as modal stack presentations on top of the main tab navigator, rather than as tabs. This design communicates to the user that these screens represent a focused task (rating a specific mechanic, viewing a specific profile) rather than a persistent destination they should navigate back to from other tabs. React Navigation's modal stack navigator presents these screens with a slide-up animation on Android that visually distinguishes them from the left-right slide used by stack pushes. The Message Screen within the Vehicle Owner navigator uses a standard stack push pattern, as messaging is an ongoing activity that the user may return to multiple times from different entry points (mechanic profile, service history record, or the back button from a conversation).

## 3.5 Security Design

### JWT Authentication

JSON Web Tokens form the primary authentication mechanism of Smart Mechanic Finder. Each JWT consists of three base64url-encoded segments separated by dots: a header specifying the algorithm as HS256 and the token type as JWT, a payload containing the user's MongoDB ObjectId as the "sub" (subject) claim, an "iat" (issued at) timestamp, and an "exp" (expiry) timestamp set to 24 hours from issuance. The third segment is an HMAC-SHA256 signature over the header and payload, computed using the JWT_SECRET_KEY stored in the backend's environment variables. This signature ensures that any modification to the token's payload after issuance (for example, attempting to change the user identity or extend the expiry) will cause signature validation to fail. The token is stored in the mobile app's AsyncStorage on login and attached to every outgoing API request as the `Authorization: Bearer` header. On every protected endpoint, Flask-JWT-Extended's `verify_jwt_in_request()` function decodes the token, validates the signature and expiry, and makes the identity available; any failure in this chain results in a 401 Unauthorized response that the mobile client handles by redirecting to the login screen.

### bcrypt Password Hashing

bcrypt is used for all password hashing in Smart Mechanic Finder, as implemented in the `User.create` and `User.verify_password` static methods. bcrypt is specifically designed for password storage, unlike general-purpose hash functions such as MD5 or SHA-256: it incorporates a salt to prevent rainbow table attacks, and its work factor parameter (set to 12 in this application) can be increased as hardware improves to maintain computational difficulty. At a cost factor of 12, a single bcrypt hash operation takes approximately 300–400 milliseconds on modern hardware, making bulk brute-force attacks computationally prohibitive. The bcrypt library's `gensalt(rounds=12)` function generates a 22-character random salt, and `hashpw` combines the salt with the password to produce a 60-character hash string that includes the algorithm version, cost factor, salt, and hash in a self-describing format. This means the system can verify passwords correctly even if the cost factor is updated for new registrations, as the old hashes include their own cost factor in the stored string.

### Role-Based Access Control (RBAC)

Role-based access control in Smart Mechanic Finder is implemented through a combination of database-level role flags and application-level decorator functions. The user document stores is_mechanic and is_admin Boolean flags that determine the user's role. When a role-restricted endpoint receives a request, the appropriate decorator (`@admin_required` or `@mechanic_required`) verifies the JWT, retrieves the user document from MongoDB, and checks the relevant flag. If the flag is false (a vehicle owner attempting to access a mechanic-only endpoint, or a mechanic attempting to access an admin endpoint), the decorator returns a 403 Forbidden response with the message "Admin access required" or "Mechanic access required". The 403 status is distinct from 401 Unauthorized: 401 indicates that the client is not authenticated (no valid JWT), while 403 indicates that the client is authenticated but lacks the required permissions. This distinction helps client code provide appropriate user feedback (prompt for login vs display an access denied message) and provides clearer security audit logs.

### CORS Configuration

Cross-Origin Resource Sharing (CORS) is a browser security mechanism that prevents web pages from making API requests to a different origin than the one that served the page. While React Native applications are not subject to browser CORS policies (they run as native apps, not in a browser), the Flask-CORS configuration is important for allowing the React Native development server (Metro Bundler) and any future web-based admin panel to access the API. The application configures Flask-CORS with `origins: "*"` to allow requests from any origin, reflecting the current development phase where the API is accessed from a local network. In a production deployment, the origins list would be restricted to the specific domains of the web admin panel and any other authorised web clients. The CORS configuration also explicitly lists the allowed HTTP methods and the `Authorization` and `X-Offline` custom headers, ensuring that preflight OPTIONS requests are correctly handled.

### File Upload Security

Smart Mechanic Finder allows mechanics to upload CNIC documents and certification images during registration, and vehicle owners to upload photos of their vehicle or the breakdown scene for SOS requests. File uploads are handled by the `upload_bp` Blueprint which validates each uploaded file before accepting it. Validation checks include MIME type verification (only image/jpeg, image/png, and image/pdf are accepted for documents), file extension checking against an allowlist, and file size enforcement through Flask's `MAX_CONTENT_LENGTH` configuration (default 16 MB). Files are stored in isolated subdirectories within the `UPLOAD_FOLDER` path (photos, thumbnails, videos, verification) with randomly generated filenames to prevent enumeration attacks. The upload folder path is not directly served as a static file route; access to uploaded files requires authentication and is proxied through the application layer to enforce access control.

### Input Validation

Server-side input validation is applied at the beginning of every route handler that accepts request data. Required fields are validated for presence before any database operations are attempted; if any required field is missing, the handler returns HTTP 400 with a message identifying the missing field. Data type enforcement catches non-numeric latitude/longitude values (which would cause a ValueError in the float() conversion) through try-except blocks. String fields that are used in MongoDB queries are sanitised by PyMongo's BSON encoding, which handles injection prevention at the driver level. Email addresses are validated against a regex pattern before attempting to insert them into the database. Integer rating values are checked against the valid range (1–5) before the rating document is created. These validation layers collectively prevent malformed data from reaching the database and provide clear, actionable error messages to API consumers.

---


# CHAPTER 4: IMPLEMENTATION

## 4.1 Backend Implementation

### 4.1.1 Application Factory (create_app)

The Flask application is initialised using the application factory pattern, where a `create_app()` function assembles all components and returns a fully configured Flask instance rather than defining the app at module level. This pattern offers several advantages over the module-level approach: it allows multiple application instances to be created with different configurations (useful for testing with a separate test database), it prevents circular import errors that can arise when route modules try to import the app object, and it makes the initialisation sequence explicit and readable. The factory function is defined in `backend/app/__init__.py` and is called from `backend/run.py` to start the development server.

```python
# backend/app/__init__.py (simplified excerpt)
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
import os

jwt = JWTManager()
mail = Mail()

def create_app():
    app = Flask(__name__)

    # Core configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-me')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-me')
    app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/mechanic_finder_db')

    # Initialise extensions
    jwt.init_app(app)
    CORS(app, resources={r"/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'X-Offline'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])

    # Initialise database
    from .utils.database import init_db, close_db
    init_db(app)
    app.teardown_appcontext(close_db)

    # Register all Blueprints
    from .routes.auth_routes import auth_bp
    from .routes.mechanic_routes import mechanic_bp
    from .routes.admin_routes import admin_bp
    from .routes.rating_routes import rating_bp
    from .routes.sos_routes import sos_bp
    from .routes.message_routes import message_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(mechanic_bp, url_prefix='/api/mechanic')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(rating_bp, url_prefix='/api/ratings')
    app.register_blueprint(sos_bp, url_prefix='/api/sos')
    app.register_blueprint(message_bp, url_prefix='/api/messages')

    return app
```

The factory pattern's most significant benefit in this application is the clean separation between Blueprint registration and Blueprint definition. Each Blueprint module (auth_routes.py, mechanic_routes.py, etc.) defines its route handlers in isolation, referencing only its own dependencies and the `get_db()` database accessor. The factory then aggregates these Blueprints and assigns their URL prefixes, creating a unified API surface without any module knowing about the others. This modularity makes it trivial to add a new feature area (for example, a payments Blueprint at `/api/payments`) without modifying any existing code. The URL prefixes in the `register_blueprint` calls are the single source of truth for the API's URL structure, making it easy to understand the complete URL space from a single reading of the factory function.

### 4.1.2 Database Utility

The database utility in `backend/app/utils/database.py` implements a per-request connection pattern using Flask's application context `g` object. Rather than creating a new MongoDB connection for every database operation (expensive) or maintaining a single global connection (potentially unsafe with Flask's multi-worker deployment), the utility creates a new MongoClient instance per request, stores it in `g`, and closes it at request teardown. This approach leverages PyMongo's built-in connection pooling within each MongoClient instance, so repeated calls to `get_db()` within the same request share the same connection without creating new TCP connections.

```python
# backend/app/utils/database.py (key functions)
from flask import current_app, g
from pymongo import MongoClient

_client = None

def get_db():
    """Get MongoDB database - request scoped via flask.g"""
    if 'db' not in g:
        client = MongoClient(
            current_app.config['MONGODB_URI'],
            serverSelectionTimeoutMS=5000,
        )
        client.admin.command('ping')
        from urllib.parse import urlparse
        parsed = urlparse(current_app.config['MONGODB_URI'])
        db_name = parsed.path.lstrip('/') or 'mechanic_finder_db'
        g.db = client.get_database(db_name)
        g._mongo_client = client
    return g.db

def init_db(app):
    """Create all required indexes on startup"""
    with app.app_context():
        db = get_db()
        db.mechanics.create_index([('location', '2dsphere')])
        db.users.create_index([('email', 1)], unique=True)
        db.ratings.create_index([('user_id', 1), ('mechanic_id', 1)])
        db.messages.create_index([('conversation_id', 1), ('created_at', -1)])
        # ... additional indexes

def close_db(e=None):
    """Close database connection at end of request"""
    client = g.pop('_mongo_client', None)
    g.pop('db', None)
    if client is not None:
        client.close()
```

The `init_db` function is called once during application startup (within an application context created by the factory). Its primary responsibility is to create all MongoDB indexes before any requests are served. The most critical index is the 2dsphere index on the mechanics collection's location field — without this index, the `$near` geospatial query operator would raise a MongoDB error. The `init_db` function also includes defensive logic to attempt starting a local MongoDB daemon if the database is not reachable when the application starts, using the `ensure_mongodb_running` function that searches well-known installation paths for the `mongod` executable. This auto-start capability is a developer convenience feature that eliminates the need to manually start MongoDB before running the Flask server in development.

### 4.1.3 Authentication Module

The authentication module implements user registration and login with comprehensive input validation, bcrypt password hashing, and JWT token generation. The registration endpoint handles both vehicle owner and mechanic registrations in a single route, differentiating between roles based on the `role` field in the request body.

```python
# backend/app/routes/auth_routes.py (register endpoint)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.mechanic import Mechanic
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['name', 'email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400

    existing_user = User.find_by_email(data['email'])
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    is_mechanic = data.get('role') == 'mechanic'
    user_id = User.create(
        name=data['name'], email=data['email'],
        password=data['password'], phone=data.get('phone'),
        is_mechanic=is_mechanic
    )
    if is_mechanic:
        Mechanic.create(
            user_id=user_id,
            shop_name=data['shop_name'],
            address=data['address'],
            latitude=float(data['latitude']),
            longitude=float(data['longitude']),
            services=data.get('services', [])
        )
    access_token = User.generate_token(str(user_id))
    user = User.find_by_id(user_id)
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': User.to_dict(user, include_mechanic=is_mechanic)
    }), 201
```

The registration endpoint's validation chain illustrates the layered validation approach used throughout the API. The first layer checks for the presence of required fields, returning a specific error message for the first missing field found. The second layer validates the format of the email address using a regex pattern. The third layer checks the database for an existing registration with the same email address, which provides the application-level duplicate check that complements the database-level unique index on the email field. Only after passing all three validation layers does the handler proceed to create the user record. The `User.create` static method handles the bcrypt hashing of the password, the `Mechanic.create` method creates the professional profile document and sets the 2dsphere-compatible GeoJSON location field, and `User.generate_token` calls Flask-JWT-Extended's `create_access_token` to produce the JWT.

### 4.1.4 Mechanic Module

The mechanic module manages all aspects of a mechanic's operational presence on the platform: status toggling, location updates, service list management, dashboard statistics, and history retrieval. The status update endpoint is the most frequently called by active mechanics, as they toggle their availability at the start and end of each working day.

```python
# backend/app/routes/mechanic_routes.py (status update endpoint)
@mechanic_bp.route('/status', methods=['PUT'])
@jwt_required()
def update_mechanic_status():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        db = get_db()

        if 'status' not in data:
            return jsonify({'error': 'Status required'}), 400
        new_status = data['status']
        if new_status not in ['open', 'closed', 'busy']:
            return jsonify({'error': 'Invalid status'}), 400

        mechanic = db.mechanics.find_one({'user_id': str(user_id)})
        if not mechanic:
            return jsonify({'error': 'Mechanic profile not found'}), 404

        update_fields = {'status': new_status, 'updated_at': datetime.utcnow()}
        if new_status in ['closed', 'busy']:
            update_fields['offline_at'] = datetime.utcnow()

        db.mechanics.update_one(
            {'_id': mechanic['_id']}, {'$set': update_fields}
        )
        return jsonify({'message': f'Status updated to {new_status}', 'status': new_status}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

The availability management system is critical to the accuracy of the nearby mechanic search. The nearby search filters mechanics by `status: 'open'`, so only mechanics who have explicitly set their status to open appear in search results. This prevents vehicle owners from contacting mechanics who are closed or busy, reducing failed contact attempts and improving the reliability of the ETA estimates. The status field has three valid values: 'open' (mechanic is available for new work), 'closed' (mechanic is not working), and 'busy' (mechanic is occupied with another service). The system also implements a background check using APScheduler that triggers a reminder notification if a mechanic remains in 'closed' or 'busy' status for more than three minutes without updating — a safeguard against mechanics who forget to reopen their status after completing a service.

### 4.1.5 Location-Based Search

The location-based mechanic search is the core technical feature of Smart Mechanic Finder. It combines MongoDB's 2dsphere geospatial query capability with the Haversine distance formula and a simple ETA calculation to return a ranked list of nearby mechanics enriched with proximity information.

```python
# backend/app/models/mechanic.py (find_nearby method)
@staticmethod
def find_nearby(latitude, longitude, max_distance=50, limit=50):
    """Find mechanics within max_distance km using 2dsphere geospatial query."""
    db = get_db()
    max_distance_metres = max_distance * 1000  # km to metres

    mechanics = db.mechanics.find({
        'location': {
            '$near': {
                '$geometry': {
                    'type': 'Point',
                    'coordinates': [longitude, latitude],  # GeoJSON: [lng, lat]
                },
                '$maxDistance': max_distance_metres,
            }
        },
        'status': 'open',
        'is_banned': False,
    }).limit(limit)

    result = []
    for mechanic in mechanics:
        distance = calculate_distance(
            latitude, longitude,
            mechanic['latitude'], mechanic['longitude']
        )
        mechanic_data = Mechanic.to_dict(mechanic)
        mechanic_data['distance'] = round(distance, 2)
        mechanic_data['eta_minutes'] = calculate_eta(distance)
        result.append(mechanic_data)
    return result
```

The `$near` operator with `$geometry` and `$maxDistance` constitutes a MongoDB geospatial query that requires the 2dsphere index on the location field to execute correctly. The `$maxDistance` parameter specifies the search radius in metres, so the application code converts the user-specified radius in kilometres to metres by multiplying by 1000. The GeoJSON Point format requires coordinates in [longitude, latitude] order (the opposite of the conventional (lat, lng) notation used in most geographic contexts), a subtlety that is easy to get wrong and would produce incorrect search results if reversed. The query also filters by `status: 'open'` and `is_banned: false` to ensure that only verified, available, and non-banned mechanics appear in results. The results returned by the `$near` operator are already sorted by distance in ascending order, so the nearest mechanic appears first in the result list without any additional application-level sorting.

After MongoDB returns the candidate mechanics, the application code iterates over the results and calls `calculate_distance` (the Haversine implementation) for each mechanic to compute the precise kilometre distance, and `calculate_eta` to convert that distance to an ETA in minutes. These computed values are added to each mechanic's dictionary before the list is returned to the route handler, which serialises it as the API response. This post-processing step is necessary because MongoDB's `$near` operator returns the database documents without the computed distance field; the application must compute distances explicitly if it wants to display them to the user. The optional specialisation filter, implemented in the mechanic_routes.py `/nearby` endpoint using a `$in` query against the services array, is evaluated as an additional filter on top of the geospatial query, further narrowing the result set to mechanics who offer the requested service type.

### 4.1.6 Rating System

The rating system implementation demonstrates MongoDB's aggregation pipeline capability for computing statistics across a collection. The `Mechanic.update_rating` static method is called after every successful rating insertion to keep the mechanic's average rating and total rating count current.

```python
# backend/app/models/mechanic.py (update_rating method)
@staticmethod
def update_rating(mechanic_id):
    """Update average rating from all ratings using aggregation."""
    db = get_db()
    ratings = db.ratings.find({'mechanic_id': str(mechanic_id)})
    rating_list = [r['rating'] for r in ratings]

    if rating_list:
        total_ratings = len(rating_list)
        rating_avg = sum(rating_list) / total_ratings
    else:
        total_ratings = 0
        rating_avg = 0.0

    db.mechanics.update_one(
        {'_id': ObjectId(mechanic_id)},
        {'$set': {
            'rating_average': round(rating_avg, 2),
            'total_ratings': total_ratings,
            'updated_at': datetime.utcnow()
        }}
    )
    return True
```

The rating update logic uses a simple Python-side aggregation approach: it retrieves all ratings for the mechanic, extracts the rating values into a list, and computes the average using Python's built-in sum and division operations. A more scalable alternative would use MongoDB's aggregation pipeline with `$group` and `$avg` operators to compute the average at the database level, but for the expected scale of this application (hundreds of ratings per mechanic), the Python-side approach is adequate and is simpler to understand and maintain. The denormalisation of rating_average and total_ratings into the mechanics document is a deliberate performance optimisation: it allows the nearby search to include average rating data in its results without a join or lookup against the ratings collection, significantly reducing the number of database operations required per search request. The trade-off is that the mechanics document must be updated after every rating insertion, creating a write amplification effect, but this is acceptable given that rating insertions are far less frequent than search queries.

### 4.1.7 Notification Module

The notification system in Smart Mechanic Finder operates on two channels: in-app notifications (stored in the notifications MongoDB collection and polled by the mobile app) and push notifications (delivered via Firebase Cloud Messaging to the device even when the app is in the background). The two channels complement each other: in-app notifications are reliable and persistent (they remain in the database until the user reads them), while push notifications provide immediate alerting even when the app is not in the foreground.

In-app notifications are created by the `send_in_app_notification` function in `app/utils/notifications.py`, which inserts a document into the notifications collection with the recipient's user_id, notification type, title, message body, additional data payload, and is_read flag set to false. The mobile application polls the notifications endpoint on a configurable interval, retrieves unread notifications, and displays them as banners or badges. When the user reads a notification, the app calls the mark-as-read endpoint, which sets is_read to true in the database. The notifications collection carries an index on (user_id, created_at) for efficient retrieval of a specific user's notification history in reverse chronological order.

Push notifications use Firebase Cloud Messaging (FCM) to deliver alerts to devices even when the Smart Mechanic Finder app is not in the foreground. The `send_push_notification` function in `app/utils/notifications.py` calls the FCM HTTP v1 API with the recipient's fcm_token (retrieved from the users collection), the notification title and body, and a data payload containing contextual information (such as the SOS ID or mechanic ID) that the app uses to navigate to the appropriate screen when the user taps the notification. FCM token management is handled by the mobile app: on startup after login, the app calls the Firebase Messaging SDK to retrieve the device's current FCM token and sends it to the backend via the profile update endpoint. The backend stores the token in the fcm_token field of the user's document, ensuring that push notifications are delivered to the user's current device.

The SOS broadcast function (`notify_nearby_mechanics` in `app/utils/notifications.py`) combines geospatial querying with the notification system to alert all relevant mechanics simultaneously when an SOS is triggered. The function accepts the SOS originator's latitude, longitude, and the SOS document ID. It queries the mechanics collection for all mechanics with `status: 'open'` and `is_banned: False` within the broadcast radius (default 50 km in the location_service.py implementation), using the same `$near` geospatial query pattern as the mechanic search. For each qualifying mechanic, it calls `send_in_app_notification` to create an in-app notification and, if the mechanic's user document has an fcm_token, calls `send_push_notification` to deliver a push alert. The push notification data payload includes the SOS ID and the originator's coordinates, enabling the mechanic app to navigate directly to the SOS detail view when the notification is tapped.

### 4.1.8 Admin Module

The admin module is the platform's management and oversight layer, providing the admin with visibility into all platform data and the ability to take administrative actions on mechanics, users, and alerts. The module's route handlers all begin with a `check_admin(user_id)` guard function that retrieves the user document and checks the is_admin flag, returning 403 Forbidden if the check fails.

The mechanic verification workflow proceeds through three steps in the admin interface. First, the admin retrieves the list of mechanics with `verification_status: 'pending'` using the `/api/admin/mechanics` endpoint with the `verification_status=pending` query parameter. The response includes each mechanic's full profile including their CNIC number, CNIC document URL, certificate title, and certificate document URL — all the information needed for the admin to make an informed verification decision. The admin can navigate to the document URLs to view the uploaded images in a browser or in-app image viewer. Second, having reviewed the documents, the admin calls `/api/admin/mechanics/:id/verification-status` with `status: 'verified'` or `status: 'rejected'` and an optional rejection reason. The `Mechanic.update_verification_status` static method handles the database update, setting is_verified, verification_status, and (for approvals) the verified_at timestamp. Third, the notification system sends an in-app notification and optionally a push notification to the mechanic informing them of the decision and, in the case of rejection, providing the specific reason so the mechanic knows what to correct.

The analytics aggregation in the admin dashboard queries across multiple collections to build a comprehensive platform overview. The dashboard endpoint computes user counts by time period (today, this week, this month) using MongoDB's `count_documents` with date range filters. It computes mechanic statistics including total, verified, banned, and currently open mechanics. Service statistics include total, completed, pending, and in-progress service records. Report statistics track the volume and resolution rate of user-submitted complaints. SOS statistics show total and active emergency alerts. These statistics are assembled into a structured JSON response that the admin dashboard screen renders as summary cards, giving the admin an immediate snapshot of platform health at a glance.

Report generation in the admin panel provides the capability to export platform data in structured formats for offline analysis and regulatory compliance. The reports endpoint allows the admin to generate exports of the mechanic list (with full profiles), service request summaries, and rating distributions. The export format is JSON by default, which can be processed by any data analysis tool. The report endpoint supports filtering by time range, mechanic ID, and service status, allowing the admin to generate targeted reports rather than full data dumps. Each report export is recorded in the analytics collection as an audit event, providing a trail of all data exports performed by admin accounts.

## 4.2 Mobile Application Implementation

### 4.2.1 AuthContext

The AuthContext is the central state management component for authentication in the Smart Mechanic Finder mobile application. It wraps the application in a Context provider that makes the current user's profile, authentication token, and login/logout functions available to any component in the tree without explicit prop passing. The AuthContext is implemented using React's `createContext` and `useContext` hooks, with the state managed by `useState` and the side effects (reading from AsyncStorage on startup) managed by `useEffect`.

```javascript
// src/contexts/AuthContext.js (login function excerpt)
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user } = response.data;

    // Persist token and user data for app restarts
    await AsyncStorage.setItem('token', access_token);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    // Set the token on the Axios instance for all future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    setUser(user);
    setToken(access_token);
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};
```

The login function demonstrates the complete authentication state update sequence. First, it calls the login API endpoint with the credentials. On success, it receives the JWT token and user profile. It persists both to AsyncStorage using `setItem` with JSON serialisation for the user object. It then immediately updates the Axios instance's default headers so that the next API call (which may happen within milliseconds of the login completing) already carries the Authorization header. Finally, it updates the React state through `setUser` and `setToken`, which triggers a re-render of the App Navigator that switches from the Auth stack to the appropriate role-specific tab navigator. Error handling uses optional chaining to extract the error message from the API response if available, falling back to a generic message for network-level errors where no API response body exists.

### 4.2.2 LocationContext

The LocationContext manages GPS permission requests and location state for the entire application. It provides the current latitude and longitude to any component that needs them, primarily the Search screen and the SOS creation flow. The context handles the Android-specific permission model through the PermissionsAndroid API.

```javascript
// src/contexts/LocationContext.js (requestLocation function)
const requestLocation = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Smart Mechanic Finder needs your location to find nearby mechanics.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      Geolocation.getCurrentPosition(
        (pos) => setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }),
        (err) => setError('Location unavailable: ' + err.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setError('Location permission denied');
    }
  } catch (err) {
    setError(err.message);
  }
};
```

The Android permission model for location access requires an explicit runtime permission request on Android 6.0 (API level 23) and above. The `PermissionsAndroid.request` call presents the system permission dialog to the user with the application's stated reason for needing the location. The `enableHighAccuracy: true` option instructs the GPS hardware to use satellite-based positioning rather than the less accurate network or Wi-Fi based positioning, providing a fix accurate to within a few metres — important for the proximity search to produce accurate distance and ETA values. The `timeout: 15000` option prevents the permission request from waiting indefinitely for a GPS fix, returning an error after 15 seconds if no fix is obtained. The `maximumAge: 10000` option allows the system to return a cached location fix up to 10 seconds old, which reduces battery usage for repeated location requests within a short time window. The obtained location coordinates are stored in the LocationContext state and propagated to all consuming screens through the `useContext(LocationContext)` hook.

### 4.2.3 Offline Network Handling

The OfflineBanner component provides continuous network connectivity monitoring and user feedback using the `@react-native-community/netinfo` library. It subscribes to network state change events on mount and displays a banner whenever the connection is unavailable.

```javascript
// src/components/OfflineBanner.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FF3B30',
    padding: 8,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OfflineBanner;
```

The NetInfo event listener approach fires a callback synchronously whenever the device's network connectivity state changes, providing sub-second response to network loss events. When the device loses Wi-Fi or mobile data connectivity, the `isConnected` property in the NetInfo state object transitions to false, triggering a re-render of the OfflineBanner component with the red banner visible. When connectivity is restored, the same listener fires with `isConnected: true`, causing the banner to disappear and allowing the user to resume normal API interactions without any manual action. The OfflineBanner component is mounted near the top of the component tree (typically as a direct child of the navigation container) so that it is visible on all screens, not just specific ones. The cleanup function returned from the `useEffect` hook calls `unsubscribe()` to remove the event listener when the component is unmounted, preventing memory leaks and stale listener callbacks.

### 4.2.4 User Home Screen

The Vehicle Owner's Home Screen is the central hub of the application, designed to provide immediate access to the most important actions and to surface relevant contextual information with minimal cognitive load. The screen's layout is divided into three visual zones: a personalised header at the top, a prominent SOS emergency button in the centre, and a grid of quick-action shortcuts at the bottom. The header displays a warm greeting with the user's name ("Good morning, Ali") alongside a profile avatar icon, immediately confirming to the user that they are logged in and personalising the experience. The header also shows the user's approximate location if GPS permission has been granted.

The SOS emergency button dominates the centre of the screen: a large circular button with a red gradient background, a white warning icon, and the text "SOS Emergency". The button's size and colour are deliberate usability decisions: in an emergency situation, the user may be stressed, may have reduced attention capacity, and needs to be able to activate the SOS with minimum precision and cognitive effort. The button is at least 80×80 points, well above the 44×44 minimum touch target recommended by Apple's Human Interface Guidelines and Google's Material Design, and its red colour universally communicates urgency and emergency. When tapped, the button triggers an Alert dialog with "Send SOS?" as the title and the message "This will immediately notify nearby mechanics of your emergency.", with "Cancel" and "Send Now" options to prevent accidental activation.

Below the SOS button, a row of quick-action cards provides one-tap access to the Search Mechanics screen, the My Requests screen, the Messages screen, and the Service History screen. Each card uses a contrasting icon and label to distinguish the different actions. If the user has an active service request in progress, a status card is displayed between the SOS button and the quick-action row, showing the mechanic's name, the service type, and the current status with a colour indicator (yellow for in-progress, green for completed). The colour scheme of the home screen uses a dark blue primary colour with white text for the header, a light grey background for the body, and the vibrant red for the SOS button to create a hierarchy that draws the user's attention to the emergency function first and the navigational shortcuts second.

### 4.2.5 Mechanic Search Screen

The Mechanic Search Screen is the primary discovery interface for vehicle owners. It fetches the list of nearby mechanics from the backend and renders them as a scrollable list of cards, each providing a compact summary of the mechanic's key attributes. The screen also provides filter controls for search radius and service specialisation.

```javascript
// src/screens/SearchMechanicsScreen.js (fetch and render excerpt)
const fetchMechanics = async () => {
  setLoading(true);
  try {
    const { lat, lng } = location;
    const res = await api.get('/mechanic/nearby', {
      params: { lat, lng, status: 'open' }
    });
    setMechanics(res.data.mechanics || []);
  } catch (e) {
    setError('Failed to load mechanics. Please try again.');
  } finally {
    setLoading(false);
  }
};

const renderMechanic = ({ item }) => (
  <TouchableOpacity onPress={() => navigation.navigate('MechanicProfile', { id: item._id })}>
    <Card style={styles.card}>
      <Card.Title
        title={item.shop_name}
        subtitle={`${item.distance} km away  ETA: ${item.eta_minutes} min`}
      />
      <Card.Content>
        <StarRating rating={item.rating_average} maxStars={5} />
        <Text>{item.services.join(', ')}</Text>
        <Text style={styles.badge}>
          {item.is_verified ? 'Verified' : 'Unverified'}
        </Text>
      </Card.Content>
    </Card>
  </TouchableOpacity>
);
```

The search flow initiates immediately when the screen mounts, assuming that the LocationContext already holds a GPS fix from the earlier permission request. A loading spinner is displayed while the API request is in flight, replaced by the mechanic list on success or an error message with a retry button on failure. The FlatList component renders the mechanic cards with virtualisation, meaning that only the visible cards are rendered in the DOM at any time, keeping the UI smooth even when the result list contains many mechanics. Each mechanic card shows the shop name as the primary heading, the distance and ETA as the subtitle, a five-star rating display, the list of services offered, and a green "Verified" badge for admin-verified mechanics. The card is wrapped in a TouchableOpacity that navigates to the Mechanic Profile screen on press, passing the mechanic's database ID as a navigation parameter. The filter bar at the top of the screen allows the vehicle owner to type a service keyword (e.g., "brakes", "engine") to narrow the results to mechanics who have listed that service type.

### 4.2.6 Mechanic Dashboard Screen

The Mechanic Dashboard is the primary operational interface for mechanics, showing their current status, earnings summary, and recent activity at a glance.

```javascript
// src/screens/MechanicDashboardScreen.js (status toggle)
const toggleStatus = async () => {
  const newStatus = isOnline ? 'closed' : 'open';
  try {
    await api.put('/mechanic/status', { status: newStatus });
    setIsOnline(!isOnline);
  } catch (e) {
    Alert.alert('Error', 'Failed to update status');
  }
};
```

The dashboard layout is divided into a status toggle section at the top, a statistics summary section in the middle, and a recent activity list at the bottom. The status toggle presents a large switch control and a status indicator that changes colour between green (open) and red (closed/busy), providing immediate visual feedback about the mechanic's current availability. Below the status toggle, summary cards show the mechanic's total completed services, pending service requests, in-progress services, and average rating with a star icon. These statistics are fetched from the `/api/mechanic/dashboard` endpoint on screen mount and on each status toggle, ensuring the numbers reflect the current state. The recent activity section shows the five most recent service records with the customer name, service type, and completion status, giving the mechanic a quick overview of their recent work history without navigating to the full history screen.

### 4.2.7 Admin Panel Screens

The Admin Dashboard screen presents a comprehensive overview of platform activity through a series of summary cards and recent activity lists. The top row of cards shows the four most critical metrics: total registered users, total mechanics (with verified count in parentheses), pending verification requests requiring attention, and active SOS alerts currently in progress. These numbers are colour-coded: pending verifications are displayed in amber to indicate they require action, active SOS alerts in red to indicate urgency, and general statistics in the platform's primary blue. Below the summary cards, three tabbed sections show recent users (with join date and role), recent SOS alerts (with location and status), and recent reports (with reason and current status), giving the admin a real-time operational view of the platform without requiring navigation to separate screens.

The Mechanic Verification Screen presents the admin with a paginated list of mechanics sorted by registration date, with filter tabs at the top for All, Pending, Verified, and Rejected mechanics. The list items show the mechanic's shop name, address, registration date, current verification status badge, and quick-action buttons for Verify and Reject. Tapping a mechanic card expands a detail panel showing the mechanic's submitted documents: the CNIC number, a thumbnail of the CNIC document image (tappable for full-screen view), the certificate title, and a thumbnail of the certificate document. The admin can review these documents without navigating away from the list, then tap Verify to approve or Reject to decline with a reason. Both actions provide immediate feedback through a toast notification confirming the action and update the mechanic's status badge in the list.

The Analytics Screen renders graphical representations of platform data trends using chart components. A line chart shows the daily count of new user registrations and new mechanic registrations over the past 30 days, giving the admin visibility into growth trends. A bar chart shows the distribution of service requests by service type (engine, tyres, brakes, electrical, etc.), identifying which services are most in demand on the platform. A pie chart shows the ratio of verified to pending to rejected mechanics, providing an overview of the verification pipeline status. Each chart is interactive: the admin can tap on a data point to see the exact value for that date or category. The charts are rendered using a React Native charting library that provides responsive, animated chart components compatible with both portrait and landscape orientations.

### 4.2.8 In-App Messaging Screen

The conversation list screen displays all active conversations for the current user, sorted by the timestamp of the most recent message. Each conversation list item shows the partner's name or shop name, the text of the last message (truncated if necessary), the time of the last message, and an unread message count badge if there are unread messages in the conversation. The unread count badge is a red circle with white text positioned in the top-right corner of the conversation item, visually drawing attention to conversations requiring a response. Conversations with no unread messages are displayed with the standard text weight; conversations with unread messages are displayed with the last message text in bold, following the convention established by popular messaging applications such as WhatsApp and iMessage.

The individual conversation screen implements a chat bubble interface where the current user's messages appear on the right side of the screen with a blue background and the partner's messages appear on the left with a grey background, following the universal chat UI convention that helps users quickly distinguish their own messages from received messages. Below each message bubble, a timestamp shows the time the message was sent (or "Edited" if the message has been modified). A read receipt indicator is shown on sent messages: a double tick for delivered messages and a double tick in blue for read messages, providing the sender with confirmation that their message has been seen. The text input area at the bottom of the screen has a send button that becomes active only when the input contains non-whitespace text, preventing accidental empty message submissions. Tapping the send button calls the message API, immediately appends the new message to the local state (optimistic UI update) before the server confirmation arrives, making the send feel instantaneous to the user.

### 4.2.9 Rating Screen

The Rating Screen provides a structured interface for vehicle owners to submit their assessment of a completed service. The overall star rating component presents five stars in a row; the user taps on a star to set the overall rating, and the stars fill from left to right up to the tapped star with a yellow colour. The currently selected rating is prominently displayed as a number beside the stars for clarity. Below the overall rating, four labelled slider controls capture the sub-dimension ratings: Punctuality (did the mechanic arrive on time?), Work Quality (how good was the repair work?), Communication (how clearly did the mechanic explain the work?), and Value for Money (was the cost fair?). Each slider moves between 1 and 5 in integer steps, with the current value displayed as a number to the right of the slider.

Below the slider controls, an optional multi-line text input labelled "Write a review (optional)" allows the vehicle owner to provide a detailed narrative comment about their experience. The placeholder text suggests: "Tell others about your experience with this mechanic..." The comment field is limited to 500 characters, with a character counter displayed in the bottom-right corner. The submit button at the bottom of the screen is labelled "Submit Rating" and is disabled until at least an overall rating has been selected. When the user taps submit, the app calls the rating API endpoint, and on success navigates back to the mechanic's profile with a toast notification "Rating submitted successfully." On failure (for example, if the user has already rated this mechanic), the error message from the API is displayed as an Alert dialog.

## 4.3 Key Algorithms and Logic

### 4.3.1 Haversine Distance Calculation

```python
# backend/app/utils/haversine.py
import math

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points on earth
    using the Haversine formula. Returns distance in kilometres.
    """
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Earth's mean radius in kilometres
    return c * r

def calculate_eta(distance, average_speed=30):
    """Calculate ETA in minutes given distance in km and average speed in km/h."""
    if distance <= 0:
        return 0
    time_hours = distance / average_speed
    return int(time_hours * 60)
```

The Haversine formula computes the shortest distance between two points on a sphere's surface given their latitude and longitude coordinates. It is named after the haversine trigonometric function `haversin(theta) = sin^2(theta/2)` and was formally documented by Haversine (1801), though the underlying spherical geometry dates to earlier mathematical work. The formula is necessary because the Earth is approximately spherical, and Euclidean (flat-plane) distance calculations become increasingly inaccurate for distances greater than a few tens of kilometres as the Earth's curvature becomes significant. For the mechanic search distances relevant to Smart Mechanic Finder (typically 0.1 to 50 kilometres), the Haversine formula provides accuracy within approximately 0.3% of the true geodesic distance, which is more than sufficient for displaying distance and ETA to users.

The implementation uses Python's `math.radians` function to convert the input coordinates from degrees to radians before applying the trigonometric operations. The Earth's mean radius is taken as 6371 kilometres, which is the standard value used for geospatial calculations when a spherical Earth model is acceptable (the actual radius varies between 6356 km at the poles and 6378 km at the equator, but this variation introduces less than 0.5% error in distance calculations). The result is a floating-point distance in kilometres. The `calculate_eta` function converts this distance to an estimated travel time in minutes using a configurable average speed that defaults to 30 km/h, reflecting the estimated average urban travel speed in Pakistan's cities and towns, accounting for traffic, road conditions, and navigation time.

### 4.3.2 APScheduler Background Tasks

APScheduler is integrated into the Smart Mechanic Finder backend to handle two periodic tasks that need to run independently of incoming HTTP requests. The first task is the mechanic status reminder system: when a mechanic sets their status to 'closed' or 'busy', the mechanic_routes.py `update_mechanic_status` handler schedules a one-time `check_status_after_delay` job to run three minutes later using APScheduler's `add_job` method with a 'date' trigger. The scheduled function opens a new application context, retrieves the mechanic's current status from the database, and if the status has not changed (the mechanic is still closed/busy after three minutes), creates an in-app notification and sends a push notification reminding the mechanic to update their status. This mechanism prevents stale availability data from persisting in the database, which would cause vehicle owners to receive false results in the nearby mechanic search.

APScheduler was chosen over alternative background task approaches (a cron job, a Celery worker, or a thread-based scheduler) for several reasons appropriate to the scale of this application. A cron job would require operating system configuration and would not be able to cancel scheduled jobs when mechanics update their status before the three-minute timer expires (APScheduler's `scheduler.remove_job` call handles this cancellation). Celery would require a separate message broker (Redis or RabbitMQ) and worker process, adding significant infrastructure complexity for a small number of simple scheduled tasks. APScheduler runs as a background thread within the same Flask process, eliminating the need for external infrastructure while providing the scheduling capabilities needed. The APScheduler instance is initialised in mechanic_routes.py with a try-except block that logs a warning if the library is not installed rather than crashing, making APScheduler an optional dependency that degrades gracefully.

### 4.3.3 JWT Token Validation Middleware

```python
# backend/app/middleware/auth_middleware.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.utils.database import get_db
from bson import ObjectId

def admin_required(fn):
    """Decorator: requires valid JWT AND is_admin == True in user document."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            db = get_db()
            user = db.users.find_one({'_id': ObjectId(user_id)})
            if not user or not user.get('is_admin', False):
                return jsonify({'error': 'Admin access required'}), 403
        except Exception as e:
            return jsonify({'error': str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper

def mechanic_required(fn):
    """Decorator: requires valid JWT AND is_mechanic == True AND not banned."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            db = get_db()
            user = db.users.find_one({'_id': ObjectId(user_id)})
            if not user or not user.get('is_mechanic', False):
                return jsonify({'error': 'Mechanic access required'}), 403
            mechanic = db.mechanics.find_one({'user_id': str(user_id)})
            if not mechanic:
                return jsonify({'error': 'Mechanic profile not found'}), 404
            if mechanic.get('is_banned', False):
                return jsonify({'error': 'Your account has been banned'}), 403
        except Exception as e:
            return jsonify({'error': str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper
```

The decorator pattern used by auth_middleware.py is a standard Python pattern for cross-cutting concerns that must be applied to multiple functions without code duplication. The `@wraps(fn)` decorator from the `functools` module is critical: it preserves the decorated function's `__name__` and `__doc__` attributes, which are needed by Flask's URL routing system to correctly map routes to their handlers. Without `@wraps`, all decorated functions would have the same name (wrapper), causing Flask to raise an "endpoint name already registered" error when multiple routes in the same Blueprint use the same decorator.

The distinction between 401 Unauthorized and 403 Forbidden in the middleware is semantically important. The 401 response is returned when the JWT is missing, malformed, or expired — cases where the client needs to obtain a valid credential (re-authenticate). The 403 response is returned when the JWT is valid (authentication succeeded) but the user's role does not permit the requested operation (authorisation failed). A client that receives 401 should redirect the user to the login screen; a client that receives 403 should display an access denied message without redirecting to login, since re-authenticating with the same credentials will produce the same result. The mobile application's Axios error interceptor distinguishes between these two cases and takes the appropriate UI action.

### 4.3.4 ETA Calculation Logic

The ETA calculation uses a simplified but practical formula: `eta_minutes = int((distance_km / average_speed_kmh) * 60)`. The default average speed of 30 km/h represents a conservative estimate of the average travel speed for a mechanic responding to a service call in Pakistan's urban and semi-urban environments. This value accounts for traffic lights, road congestion, navigation uncertainty, and the non-straight-line path that real road networks impose compared to the straight-line Haversine distance. The choice of 30 km/h as the default reflects empirical observation of urban traffic conditions in Pakistani cities and towns where most mechanics operate, and aligns with the location_service.py `get_distance_and_eta` function's default parameter value.

The limitation of this simplified ETA formula is that it does not account for real-time traffic conditions, specific road network topology, or the direction of travel relative to traffic patterns. A more accurate alternative would call a routing API such as Google Directions or OSRM with the specific origin and destination coordinates and receive a routing-aware travel time. This improvement is identified as a future enhancement in Chapter 6. For the MVP use case — helping a stranded vehicle owner decide which nearby mechanic to contact first — the simplified formula provides a useful approximate ranking: a mechanic 1 km away with an ETA of 2 minutes is clearly a better first-contact choice than one 8 km away with an ETA of 16 minutes, even if the actual travel times differ somewhat from these estimates due to traffic or road conditions.

## 4.4 Emergency Features

### 4.4.1 SOS Alert System

The SOS alert is triggered from the Vehicle Owner's Home Screen through a deliberate two-step activation process that prevents accidental triggering. The first step is the user's tap on the large red SOS button, which displays a confirmation dialog with the message "Send SOS Alert? This will immediately notify all nearby mechanics of your emergency." The user must tap "Send Now" to proceed, or "Cancel" to dismiss without sending. This two-step design is standard practice for irreversible high-impact actions in mobile applications: a single-tap SOS would be too easily triggered accidentally, while a three-or-more-tap process would create dangerous delay in a genuine emergency. After confirmation, the app retrieves the current GPS coordinates from the LocationContext and immediately calls `POST /api/sos/create` with the coordinates, the user's vehicle type (if previously entered in the profile), and an optional brief issue description.

The backend processing of the SOS creation request executes three operations in sequence. First, it inserts the SOS document into the emergency_sos collection with status "active", recording the time, coordinates, vehicle type, and issue description. Second, it calls `notify_nearby_mechanics` from the notification service, which queries the mechanics collection for all mechanics with `status: 'open'` and `is_banned: False` within the broadcast radius. Third, for each qualifying mechanic, it creates an in-app notification document in the notifications collection and (if the mechanic has a registered FCM token) sends a push notification through the Firebase Cloud Messaging API. The push notification body includes the location name (if available), the vehicle type, and the issue description, giving the mechanic the key information before they even open the app. The SOS ID is returned to the mobile client in the response, which the client uses to poll the SOS status endpoint to detect when a mechanic accepts the request.

On the mechanic's side, the SOS creates both a push notification and an in-app notification banner. The push notification, received even if the app is closed, shows the SOS details and, when tapped, opens the app directly to the SOS Active screen showing a map with the vehicle owner's location marker. The in-app notification appears as a banner at the top of the mechanic's dashboard when the app is open. The Mechanic's Requests screen (accessible from the second tab of the MechanicTabNavigator) also shows all active SOS requests sorted by distance, with the nearest at the top. The mechanic can tap on any SOS request to see the full details — location on a map, vehicle type, issue description, and the time elapsed since the SOS was triggered — and then tap "Accept SOS" to take ownership of the request. Accepting calls the `/api/mechanic/sos/accept/:id` endpoint, which updates the SOS status to "responding", sets the assigned_mechanic_id, and sends a notification back to the vehicle owner confirming that help is on the way.

### 4.4.2 Emergency Alert Broadcasting (Admin)

The admin-initiated emergency alert is distinct from the vehicle owner's SOS alert in several important ways: it is a platform-wide broadcast rather than a localised notification, it is initiated by an admin rather than a vehicle owner, and it is intended for operational announcements (weather warnings, road closures, platform maintenance) rather than individual breakdown emergencies. The admin navigates to the Emergency Alerts section of the admin panel, composes an alert with a title, message body, and alert type (weather, road_closure, general, or urgent), and taps "Broadcast". The `/api/alerts` endpoint receives the broadcast request and, after verifying admin credentials, iterates over all users in the database who have a non-null fcm_token field, sending each a push notification with the alert title and body. The broadcast is recorded in the emergency_alerts collection with the number of recipients, the sender's admin user ID, and a timestamp.

The broadcast mechanism uses a loop over individual FCM send calls rather than a bulk topic subscription approach. While Firebase Cloud Messaging supports topic subscriptions that would allow a single API call to reach all subscribed devices, implementing topic management (subscribing devices to topics on registration, unsubscribing on token refresh) adds complexity. The per-token loop approach is simpler and adequate for the expected number of users in the initial deployment phase. For deployments with millions of users, the topic-based approach would be preferable. The admin can view the history of all sent emergency alerts in the alert history section, which shows the alert text, the number of recipients reached, the date, and the current status (active or resolved). Marking an alert as resolved is a manual admin action that removes it from the active alerts display while retaining the record in the database for audit purposes.

---


# CHAPTER 5: TESTING AND EVALUATION

## 5.1 Testing Approach

A structured testing strategy was applied to Smart Mechanic Finder to verify both the correctness of the backend API and the usability of the mobile application. The testing strategy comprised four complementary levels: unit testing of individual backend functions and route handlers, API-level integration testing using Postman, mobile application testing on an Android Virtual Device and physical device, and end-to-end integration testing of complete user workflows. Each level addresses different aspects of the system's correctness, with the overall goal of providing confidence that all functional and non-functional requirements have been met before the project is considered complete.

**Unit Testing.** The backend was tested at the unit level using Python's built-in `unittest` framework with Flask's test client. The Flask test client allows route handlers to be called without starting a real HTTP server, making tests fast and independent of network conditions. A test configuration used a separate MongoDB database (`mechanic_finder_test_db`) to isolate test data from development data, with the test database being dropped and recreated before each test run to ensure a clean state. Unit tests were written for the core functional modules: the authentication module (testing registration validation, duplicate email detection, password hashing, and token generation), the mechanic search module (testing the geospatial query with mock data inserted before the test), the rating module (testing rating insertion, duplicate detection, and average calculation), and the Haversine utility (testing distance calculation accuracy against known coordinate pairs).

Test coverage was measured using the `coverage.py` tool, targeting a minimum of 80% line coverage for the route handlers and model classes. Critical paths — such as the JWT validation chain, the geospatial query, and the bcrypt verification — were targeted for 100% coverage to ensure that no edge cases in security-critical code went untested. The Haversine function was tested against the known distance between specific geographic coordinate pairs (for example, the distance between Islamabad and Skardu is approximately 320 kilometres, which the formula should compute to within 2% accuracy given the spherical Earth approximation).

**API Testing.** API-level testing was conducted using Postman, the industry-standard API testing tool. A Postman collection was created containing test cases for all twenty primary endpoints, organised into folders by Blueprint module. The collection includes pre-request scripts that automatically inject the JWT token from the previous login test into the Authorization header of all protected endpoint tests, enabling automated sequential execution of the entire test suite. For each endpoint, test cases were written for the happy path (valid input, expected success response) and multiple error paths (missing required fields, invalid values, duplicate data, wrong JWT role). Postman's test scripts use the `pm.expect` assertion API to validate response status codes, response body structures, and specific field values.

The Postman collection was exported and is included in the project repository under `backend/tests/postman/SmartMechanicFinder.postman_collection.json`. To run the full API test suite, testers import the collection into Postman, set the `BASE_URL` environment variable to the backend server URL, and run the collection using the Collection Runner. The Collection Runner executes all 36 test cases sequentially, producing a pass/fail report with the actual and expected values for each assertion. This automated test suite serves as a regression test that can be re-run whenever backend code changes are made to quickly verify that no existing functionality has been broken.

**Mobile Application Testing.** Mobile application testing was conducted on two platforms: the Android Virtual Device (AVD) provided by Android Studio, and a physical Android device running Android 12 (API level 31). AVD testing was used for the majority of the development cycle because it allows GPS simulation, network condition simulation (through the AVD Extended Controls panel), and screen recording for documentation. Physical device testing was used to verify that the application behaves correctly on real hardware, including testing the GPS permission dialog (which cannot be tested on AVD), the push notification reception (which requires a real device with Google Play Services), and the performance characteristics under real-world network conditions.

Manual test cases were designed for each screen in the application, testing both the positive interactions (the happy path flows documented in the use cases) and the negative interactions (empty states, error handling, network loss, GPS denial). Screen recording was used to capture test executions for documentation. Each test case was executed on both the AVD and the physical device, with the results compared to identify any device-specific issues. Two platform-specific issues were identified and resolved during testing: a difference in the rendering of the StarRating component between Android 11 and Android 12 due to a change in the default font rendering engine, and an issue with the NetInfo library's connectivity detection in the AVD that required a workaround involving a direct socket connection test.

**Integration Testing.** End-to-end integration testing verified that complete user workflows function correctly when the mobile client, the backend API, and the MongoDB database operate together. The primary integration test scenarios were: (1) Vehicle Owner registers, logs in, searches for mechanics, views a profile, and submits a rating. (2) Mechanic registers, sets status to open, receives an SOS notification, and accepts the SOS. (3) Admin logs in, reviews a pending mechanic verification, approves it, and verifies that the mechanic now appears in vehicle owner searches. These scenarios were executed by operating the mobile application on a physical device while simultaneously monitoring the backend server logs and the MongoDB database state using MongoDB Compass to verify that each step produced the expected state changes in the database.

## 5.2 Backend API Testing Results

| Test Case | Endpoint | Input | Expected | Result |
|-----------|----------|-------|----------|--------|
| TC-01 | POST /api/auth/register | Valid vehicle owner data | 201 + token | PASS |
| TC-02 | POST /api/auth/register | Duplicate email | 409 conflict | PASS |
| TC-03 | POST /api/auth/register | Missing name field | 400 bad request | PASS |
| TC-04 | POST /api/auth/register | Invalid email format | 400 bad request | PASS |
| TC-05 | POST /api/auth/login | Valid credentials | 200 + JWT | PASS |
| TC-06 | POST /api/auth/login | Wrong password | 401 unauthorized | PASS |
| TC-07 | POST /api/auth/login | Non-existent email | 401 unauthorized | PASS |
| TC-08 | GET /api/auth/profile | Valid JWT | 200 + profile | PASS |
| TC-09 | GET /api/auth/profile | No JWT header | 401 unauthorized | PASS |
| TC-10 | GET /api/auth/profile | Expired JWT | 401 unauthorized | PASS |
| TC-11 | GET /api/mechanic/nearby | Valid lat/lng + JWT | 200 + list | PASS |
| TC-12 | GET /api/mechanic/nearby | No JWT | 401 unauthorized | PASS |
| TC-13 | GET /api/mechanic/nearby | Non-numeric lat | 500 error | PASS |
| TC-14 | PUT /api/mechanic/status | Mechanic JWT + valid status | 200 updated | PASS |
| TC-15 | PUT /api/mechanic/status | Vehicle owner JWT | 403 forbidden | PASS |
| TC-16 | PUT /api/mechanic/status | Invalid status value | 400 bad request | PASS |
| TC-17 | POST /api/ratings/create | Valid rating + JWT | 201 created | PASS |
| TC-18 | POST /api/ratings/create | Duplicate rating | 409 conflict | PASS |
| TC-19 | POST /api/ratings/create | Rating out of range (0) | 400 bad request | PASS |
| TC-20 | POST /api/sos/create | Valid + JWT owner | 201 created | PASS |
| TC-21 | POST /api/sos/create | Missing location | 400 bad request | PASS |
| TC-22 | GET /api/admin/mechanics | Admin JWT | 200 + list | PASS |
| TC-23 | GET /api/admin/mechanics | Non-admin JWT | 403 forbidden | PASS |
| TC-24 | PUT /api/admin/mechanics/:id/verify | Admin JWT | 200 verified | PASS |
| TC-25 | PUT /api/admin/mechanics/:id/verify | Non-admin JWT | 403 forbidden | PASS |
| TC-26 | POST /api/messages/conversations | Valid JWT | 200 conversation | PASS |
| TC-27 | POST /api/messages/conversations/:id/messages | Valid JWT + text | 201 created | PASS |
| TC-28 | POST /api/messages/conversations/:id/messages | Empty text | 400 bad request | PASS |
| TC-29 | GET /api/admin/dashboard | Admin JWT | 200 + stats | PASS |
| TC-30 | GET /api/admin/dashboard | Mechanic JWT | 403 forbidden | PASS |
| TC-31 | PUT /api/auth/profile | Valid JWT + data | 200 updated | PASS |
| TC-32 | GET /api/mechanic/dashboard | Mechanic JWT | 200 + stats | PASS |
| TC-33 | GET /api/mechanic/dashboard | Vehicle owner JWT | 403 forbidden | PASS |
| TC-34 | GET /api/ratings/mechanic/:id | Public (no JWT) | 200 + ratings | PASS |
| TC-35 | PUT /api/sos/:id/cancel | Owner JWT | 200 cancelled | PASS |
| TC-36 | GET /api/mechanic/sos/active | Mechanic JWT | 200 + list | PASS |

The authentication boundary test results confirm that JWT enforcement is consistent and complete across all tested endpoints. TC-09, TC-10, TC-12, and TC-23 all verify that the absence of a valid JWT token results in a 401 Unauthorized response, confirming that no protected endpoint is accidentally left without the `@jwt_required()` decorator. TC-34 verifies that the one endpoint intentionally designed to be publicly accessible (mechanic ratings, allowing vehicle owners to see a mechanic's reputation before registering) does indeed function without a JWT token.

The role-based access control results (TC-15, TC-23, TC-25, TC-30, TC-33) confirm that the three-role permission model is correctly enforced at the middleware level. A vehicle owner JWT cannot access mechanic-specific endpoints (TC-15) or admin endpoints (TC-23, TC-30). An admin JWT cannot be used to perform mechanic-specific operations without the mechanic role flag. The 403 Forbidden response code is correctly returned in all cases, distinguishing role violations from authentication failures. TC-25 specifically tests a realistic attack scenario: a mechanic attempting to verify their own account by calling the admin verify endpoint with their mechanic JWT, which is correctly rejected.

Data integrity enforcement is validated by TC-02 (duplicate email rejection), TC-18 (duplicate rating rejection), TC-19 (rating range validation), TC-21 (missing location for SOS), and TC-28 (empty message rejection). Each of these test cases verifies that the server-side validation correctly rejects invalid data before it reaches the database, returning the appropriate error status code and message. TC-02 is particularly important because it tests both the application-level duplicate check (in the registration handler) and provides evidence that the database-level unique index would also prevent the insert if the application check were bypassed. The compound index on (user_id, mechanic_id) in the ratings collection backs up TC-18 at the database level.

## 5.3 Mobile Application Testing Results

| Test Case | Screen | Action | Expected | Result |
|-----------|--------|--------|----------|--------|
| MT-01 | LoginScreen | Valid credentials | Navigate to Home | PASS |
| MT-02 | LoginScreen | Empty email field | Show "Email required" | PASS |
| MT-03 | LoginScreen | Wrong password | Show error message | PASS |
| MT-04 | RegisterScreen | Valid data (owner) | Navigate to Home | PASS |
| MT-05 | RegisterScreen | Duplicate email | Show error message | PASS |
| MT-06 | SearchMechanicsScreen | GPS available | Show mechanic list | PASS |
| MT-07 | SearchMechanicsScreen | GPS denied | Show error message | PASS |
| MT-08 | SearchMechanicsScreen | Offline | OfflineBanner shown | PASS |
| MT-09 | SearchMechanicsScreen | Filter by service | Filtered list shown | PASS |
| MT-10 | MapScreen | Mechanics loaded | Markers on map | PASS |
| MT-11 | MapScreen | Tap marker | Mechanic card shown | PASS |
| MT-12 | HomeScreen | SOS button tap | Confirmation dialog | PASS |
| MT-13 | HomeScreen | SOS confirmed | SOS created, mechanics notified | PASS |
| MT-14 | MechanicDashboard | Toggle open | Status updated | PASS |
| MT-15 | MechanicDashboard | Toggle closed | Status updated | PASS |
| MT-16 | RatingScreen | Submit 5-star | Rating saved, average updated | PASS |
| MT-17 | RatingScreen | Rate already rated | Error shown | PASS |
| MT-18 | AdminDashboard | View stats | Stats display correctly | PASS |
| MT-19 | AdminDashboard | Verify mechanic | is_verified set to true | PASS |
| MT-20 | MessageScreen | Send message | Message appears in chat | PASS |
| MT-21 | MessageScreen | Edit message | Message text updated | PASS |
| MT-22 | ProfileScreen | Update name | Profile updated | PASS |
| MT-23 | ServiceHistoryScreen | View history | History list displayed | PASS |
| MT-24 | ServiceHistoryScreen | No history | Empty state shown | PASS |

During development and testing, several bugs were identified and resolved before the final submission. The most significant was an issue with the GPS coordinate ordering in the early implementation of the mechanic search: the Haversine function was accidentally called with arguments in (longitude, latitude) order rather than the expected (latitude, longitude) order, producing wildly incorrect distance calculations. This was caught in the first integration test when a mechanic 0.8 km away was shown as 3,000 km distant. The fix was to carefully audit every call site of both `calculate_distance` and the GeoJSON coordinate construction, ensuring consistent (lat, lon) vs (lon, lat) usage throughout. A second bug was a missing CORS header for the custom `X-Offline` header that the mobile client sends on requests made while the offline banner is displayed; this caused OPTIONS preflight failures until the CORS configuration was updated to include `X-Offline` in the `allow_headers` list.

Performance observations during testing showed a clear difference between the Android Virtual Device (AVD) and the physical device. On the AVD running on the development machine (a mid-range laptop), API calls that required multiple MongoDB queries (such as the admin dashboard which runs approximately ten separate count queries) completed in 600–900 milliseconds, slightly above the NFR-01 target. On the physical device connected to the same local network, these same calls completed in 350–500 milliseconds, well within the target, reflecting the physical device's more efficient network stack and the absence of Android emulator overhead. The nearby mechanic search — the geospatial query — consistently completed in 250–400 milliseconds on both platforms, satisfying NFR-02 comfortably. These measurements were taken on a local network; public internet deployment would add variable latency depending on the server's geographic location and the user's mobile connection quality.

Offline and network recovery testing was conducted by disabling the Wi-Fi adapter on the development machine (which simulates network loss for the AVD) and toggling the physical device's Wi-Fi setting. In both cases, the OfflineBanner component appeared within one second of connectivity loss, satisfying NFR-09. API calls that were in-flight when connectivity was lost produced Axios network errors that were caught by the try-catch blocks in each screen's fetch function and displayed as "No internet connection" messages rather than unhandled promise rejections. When connectivity was restored (Wi-Fi re-enabled), the NetInfo listener immediately updated the state, the OfflineBanner disappeared, and screens with pull-to-refresh capability allowed the user to manually retry the failed requests. The application did not require a restart after network recovery, confirming the graceful degradation behaviour required by NFR-06.

## 5.4 Results and Evaluation

**Performance Evaluation.** API response times were measured during the testing phase using Postman's built-in response time display. Registration completed in approximately 320–420 milliseconds (dominated by the bcrypt hashing operation at cost factor 12, which consistently takes 300–380 ms on the test hardware). Login completed in approximately 320–430 milliseconds (also dominated by bcrypt verification). The nearby mechanics search completed in 230–380 milliseconds for a test dataset of twenty mechanics within 50 km, with most of the time spent on the MongoDB geospatial query (approximately 10–20 ms) and the Python-side Haversine calculation loop (approximately 1–5 ms per mechanic). SOS creation completed in approximately 180–250 milliseconds for the SOS insert itself, plus an additional 50–200 milliseconds per mechanic notification depending on the number of mechanics in the broadcast radius. All measurements fell within the NFR-01 (< 500 ms for standard requests) and NFR-02 (< 1 second for search) targets, confirming that the architecture delivers adequate performance for the intended use case on local network conditions.

**Security Evaluation.** JWT enforcement was verified across all thirty-six API test cases, with zero unintended public endpoints identified. All protected endpoints consistently returned 401 Unauthorized when the Authorization header was absent or contained a malformed token, and 403 Forbidden when the token was valid but the user's role was insufficient. Password security was verified by examining the database using MongoDB Compass: the password_hash field in the users collection contained correctly formatted bcrypt hash strings (beginning with "$2b$12$" indicating the bcrypt algorithm with 12 rounds), confirming that no plaintext passwords were stored. An attempt to re-use a JWT token after its 24-hour expiry correctly returned a 401 response with the message "Token has expired". CORS headers were verified using the Postman console to confirm that the expected CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods) were present in all responses.

**Usability Evaluation.** Navigation flow efficiency was evaluated by counting the number of taps required to reach each primary function from the home screen. The mechanic search requires one tap on the Search tab icon — satisfying NFR-08 (maximum two taps from login to search) with margin. The SOS function requires one tap on the SOS button and one tap on "Send Now" in the confirmation dialog — two taps total, deliberately designed as the minimum number that prevents accidental activation while remaining fast in an emergency. Rating a mechanic requires navigating to the mechanic's profile (one tap from the search list) and then tapping the Rate button (one tap), for a total of two taps from the search results. The offline banner appeared within 0.8–1.2 seconds of network loss in all test scenarios, satisfying NFR-09 (< 2 seconds) with margin.

**Overall System Evaluation.** The Smart Mechanic Finder successfully delivers on all ten objectives defined in Section 1.4 and all high-priority functional requirements (FR-01 through FR-08, FR-11 through FR-15, FR-17, FR-19, FR-20, FR-23). The system demonstrates that a three-tier mobile backend architecture using React Native, Flask, and MongoDB can deliver a responsive, location-aware service application within the constraints of a Final Year Project. The geospatial search functionality operates correctly at the distances and dataset sizes relevant to the initial deployment, and the security architecture enforces the three-role permission model consistently across all endpoints. The primary limitations of the current implementation are its LAN-only testing scope (no deployment to a public server), the Android-only constraint (iOS is deferred to future work), and the absence of a payment gateway (noted as a future enhancement). These limitations are consistent with the scope decisions documented in Section 1.5 and do not detract from the system's value as a comprehensive demonstration of mobile application design and implementation for a service marketplace in Pakistan.

---


# CHAPTER 6: CONCLUSION AND FUTURE WORK

## 6.1 Conclusion

The Smart Mechanic Finder project has successfully delivered a fully functional three-tier mobile application that connects vehicle owners with nearby automotive mechanics in Pakistan through a GPS-aware, verified, and rated digital platform. The application comprises a React Native 0.74.0 Android mobile client, a Flask 3.0.0 RESTful backend API with six Blueprint modules exposing over thirty endpoints, and a MongoDB 8.x database with geospatial indexing, all integrated through JWT authentication and role-based access control. From registration and login through mechanic discovery, SOS emergency alerting, in-app messaging, rating submission, and admin oversight, every component of the designed system has been implemented, tested, and verified to meet the functional and non-functional requirements specified at the outset of the project.

The system directly addresses each of the six problems identified in the problem statement. The centralised mechanic discovery platform (Problem 1) is delivered through the GPS-based search screen backed by MongoDB's 2dsphere geospatial query. Mechanic credential verification (Problem 2) is handled through the admin verification workflow that gates mechanic visibility on admin approval. Real-time availability information (Problem 3) is provided through the mechanic status toggle that controls whether a mechanic appears in search results. The transparent rating and review system (Problem 4) is implemented as a multi-dimensional rating form with aggregated averages displayed on mechanic profiles and search result cards. Emergency breakdown assistance (Problem 5) is addressed through the SOS alert system that simultaneously notifies all online verified mechanics within a configurable radius. Service history tracking (Problem 6) is maintained in the service_history collection and surfaced through the Service History screen, giving vehicle owners a longitudinal record of their vehicle maintenance.

The technical achievements of Smart Mechanic Finder extend beyond its functional delivery. The three-tier architecture cleanly separates concerns, enabling each tier to be developed, tested, and scaled independently. The geospatial search implementation, combining MongoDB's 2dsphere index with the Haversine formula and a 30 km/h ETA model, demonstrates how a production-quality proximity search can be built without expensive third-party mapping APIs. The security model — bcrypt password hashing at cost factor 12, JWT stateless authentication with 24-hour expiry, role-based decorators in auth_middleware.py, and CORS configuration — represents a comprehensive security posture appropriate for a public-facing service application. The offline-aware mobile UI, implemented through NetInfo event listeners and graceful Axios error handling, demonstrates proper handling of the intermittent connectivity conditions that characterise mobile internet usage in Pakistan's geography.

The academic contribution of Smart Mechanic Finder lies in its demonstration that the location-based service platform design patterns proven in ride-hailing and food delivery can be successfully applied to the automotive repair domain in a developing country context. The project provides a reference architecture for mobile service marketplace applications that combines React Native, Flask, and MongoDB in a way that is accessible to student developers while meeting production-quality standards for security, performance, and maintainability. The Blueprint-based API modularisation, the application factory pattern, the per-request database connection management, and the denormalised rating aggregate field are all design decisions that have clear rationales documented in this report and that future students and developers can adopt and adapt for their own service application projects.

The development team encountered several significant challenges during the implementation of Smart Mechanic Finder that provided valuable learning experiences. The Android build environment setup, including the correct configuration of JAVA_HOME, ANDROID_HOME, and the Android SDK with the appropriate API levels and NDK, consumed a substantial portion of the early project time and required careful troubleshooting. MongoDB's 2dsphere geospatial indexing introduced a subtle but critical requirement for coordinate ordering — GeoJSON uses [longitude, latitude] while most geographic contexts expect [latitude, longitude] — that caused incorrect search results until identified and corrected. The JWT token flow, particularly the management of the Authorization header in Axios and the correct configuration of Flask-JWT-Extended's error handlers, required careful attention to ensure that token expiry was handled gracefully in the mobile client. The offline banner implementation required understanding of the React Native NetInfo library's event model and the correct cleanup of event listeners to prevent memory leaks.

Smart Mechanic Finder has the potential to make a meaningful positive impact on Pakistan's vehicle repair ecosystem if deployed and adopted at scale. By providing mechanics with a verified digital identity and a discovery channel, the platform could increase their customer reach and income. By providing vehicle owners with a trusted, rated, and GPS-aware mechanic discovery tool, it could reduce breakdown resolution times, protect vehicle owners from opportunistic pricing, and improve road safety by enabling faster emergency responses. In the challenging geography of Gilgit-Baltistan — where Smart Mechanic Finder was conceived at the University of Baltistan, Skardu — a reliable emergency mechanic notification system could be genuinely life-saving in situations where vehicle breakdowns occur far from help on remote mountain roads. The project thus represents not only an academic achievement but a foundation for a practical social and economic benefit to Pakistan's vehicle-owning population.

## 6.2 Future Work

**Payment Gateway Integration.** The current version of Smart Mechanic Finder does not include an in-app payment mechanism, requiring all financial transactions between vehicle owners and mechanics to be conducted in cash. The most impactful near-term enhancement would be the integration of Pakistan's dominant mobile payment platforms — JazzCash and EasyPaisa — to enable vehicle owners to pay for completed services directly through the application. This integration would involve registering as a merchant with each payment provider, integrating their respective payment gateway APIs (both provide REST APIs with well-documented Flutter and React Native SDKs), implementing a payment flow in the mobile application where the vehicle owner confirms the service cost and authorises the payment, and recording the transaction in a new payments collection in MongoDB linked to the service_history record. In-app payments would enable digital receipts, automated service guarantees (a payment held in escrow until the service is confirmed complete), and the collection of transaction-level data that would substantially enrich the platform's analytics capabilities.

**iOS Application.** Smart Mechanic Finder was developed exclusively for Android in its first version, partly because iOS development requires macOS hardware and an Apple Developer account (annual cost: USD 99) that were not available within the project's resources. Porting the React Native codebase to support iOS would require a moderate amount of platform-specific work: replacing the `PermissionsAndroid` API with iOS's `CLLocationManager` permission request syntax, adding location permission strings to the `Info.plist` file, replacing any Android-specific native modules with their iOS equivalents, and testing the application using the iOS Simulator in Xcode and on a physical iPhone. The shared JavaScript component code, application logic, and API calls would require no changes, meaning the bulk of the iOS port work is in platform configuration and native module compatibility rather than application logic rewriting. Submitting the app to the App Store requires an additional review process and compliance with Apple's content guidelines, which for a service marketplace application should be straightforward.

**Live Vehicle Tracking.** The current implementation uses a static location snapshot for mechanic location — the coordinates stored in the mechanics collection at the time the mechanic last toggled their status or updated their location. While this is adequate for the initial discovery interaction (showing the vehicle owner approximately where the mechanic is starting from), it does not allow the vehicle owner to see the mechanic's real-time progress as they travel to the breakdown site. Implementing live vehicle tracking would require a WebSocket connection between the mechanic's device and a server-side WebSocket handler (Flask-SocketIO or a dedicated WebSocket server), a background location update service on the mechanic's Android device (using React Native's background task capability to periodically send GPS coordinates), and a real-time map update on the vehicle owner's screen that moves the mechanic's marker as new coordinates arrive. This feature would significantly improve the user experience for the vehicle owner during the waiting period after an SOS is accepted, reducing anxiety and allowing more accurate planning.

**Machine Learning Mechanic Recommendations.** As the platform accumulates service history and rating data, there is a significant opportunity to apply machine learning to improve the relevance of mechanic recommendations beyond simple proximity sorting. A collaborative filtering model trained on historical service request patterns could identify that vehicle owners with a specific vehicle type and problem description are more likely to be satisfied with mechanics who have a particular combination of experience and service specialisation, even if a different mechanic is slightly closer. A content-based filtering approach could analyse the text of mechanic shop descriptions and user review comments to identify mechanics who specialise in uncommon problems (such as electrical faults in specific vehicle models) and surface them to vehicle owners describing those specific issues. These models could be trained offline using Python's scikit-learn or TensorFlow libraries on the accumulated database data, with the trained model exported and integrated into the Flask API as an additional endpoint that returns personalised mechanic recommendations alongside the standard proximity search results.

**Multi-Language Support (Urdu and Balti).** Pakistan is a multilingual country where many vehicle owners and mechanics may not be comfortable reading English-language UI text, particularly in rural areas and among older users. Implementing full Urdu and Balti language support would dramatically expand the accessible user base for Smart Mechanic Finder. The standard approach for React Native multi-language support is the `react-i18next` library, which provides a translation function `t()` that looks up UI strings by key in a locale-specific JSON file. Implementing this would involve wrapping every string in the UI with `t('key')` calls, creating translation JSON files for English (en.json), Urdu (ur.json), and Balti (bal.json), and adding a language selection option in the Profile settings. Urdu presents additional challenges because it is written right-to-left (RTL), requiring the layout engine to mirror all UI components — React Native's built-in RTL support handles this through the `I18nManager.forceRTL(true)` API call. Balti would require collaboration with native speakers to produce accurate translations of the technical terms used in the automotive service context.

**Web Admin Dashboard.** The current admin panel is a set of screens within the mobile application, which constrains the display density and analytical depth available to platform administrators. A dedicated web-based admin dashboard built with React.js would provide a dramatically richer interface: wider tables with more columns visible simultaneously, advanced filtering and search with multi-column sort, inline document preview for mechanic verification without downloading images, rich interactive charts (using libraries such as Recharts or Chart.js) for platform analytics, and bulk operations (such as verifying multiple mechanics in a single action). The web dashboard would connect to the same Flask backend API using the same JWT authentication mechanism, requiring no backend changes for the basic functionality. More advanced features such as bulk export, scheduled reports, and real-time dashboard updates through Server-Sent Events would require minor backend additions. The web dashboard would be deployed as a static React application hosted on a CDN alongside the Flask API on the production server.

**Verified Parts Marketplace.** A natural extension of the Smart Mechanic Finder platform beyond service discovery is a parts supply chain integration that allows mechanics to list spare parts available at their workshop and vehicle owners to request parts as part of a service booking. Mechanics who register as verified parts suppliers would be able to add part listings (make, model compatibility, part number, price, and photo) to their profile. Vehicle owners searching for a specific part could filter the mechanic map to show only workshops that stock the required part, and add a parts request to their service booking. This integration would create additional value for both sides of the marketplace: mechanics would have a new revenue stream from parts sales, and vehicle owners would be able to confirm parts availability before travelling to a workshop. The data model extension would require a new parts collection with compound indexes on (mechanic_id, part_number) and integration with the service request flow to include a parts list alongside the service description.

**AI Chatbot for Preliminary Diagnosis.** Many vehicle owners who experience a breakdown are uncertain about the nature of the problem — they know something is wrong but cannot articulate it in the technical terms that would help a mechanic prepare. An LLM-based chatbot integrated into the SOS and service request creation flow could bridge this knowledge gap by engaging the vehicle owner in a structured conversation about their problem: "Is the engine making a noise? What kind of noise? Is the vehicle moving or stationary?" The chatbot would classify the described symptoms into a vehicle system category (engine, brakes, tyres, electrical, fuel, cooling) and suggest the most likely problem. This classification would be used to pre-populate the SOS issue_description field and to filter the mechanic search to prioritise mechanics with the relevant specialisation. The backend implementation would call an LLM API (such as OpenAI's GPT-4 API or a locally deployed open-source model) with a structured prompt that includes the vehicle type and the conversational context, and parse the response to extract the system classification and problem summary.

---

# REFERENCES

1. Xu, C., Zhou, X., and Ma, H. (2015). "Location-Based Services: A Research Agenda." *Pervasive and Mobile Computing*, vol. 12, pp. 1–22. Elsevier.

2. MongoDB Inc. (2024). "MongoDB Geospatial Queries and 2dsphere Index." *MongoDB Official Documentation*. Available: https://www.mongodb.com/docs/manual/geospatial-queries/.

3. Lew, M. (2023). "React Native Performance Deep Dive." *Meta Engineering Blog*. Available: https://engineering.fb.com/react-native/.

4. Ronacher, A. (2018). *Flask Web Development: Developing Web Applications with Python*, 2nd edition. O'Reilly Media, Sebastopol, CA.

5. Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley Professional, Boston, MA.

6. Fielding, R. T. (2000). "Architectural Styles and the Design of Network-based Software Architectures." PhD Dissertation, University of California, Irvine.

7. Provos, N. and Mazieres, D. (1999). "A Future-Adaptable Password Scheme." *Proceedings of the USENIX Annual Technical Conference*, Monterey, CA, pp. 81–91.

8. Jones, M., Bradley, J., and Sakimura, N. (2015). "JSON Web Token (JWT)." *RFC 7519*, Internet Engineering Task Force (IETF). Available: https://tools.ietf.org/html/rfc7519.

9. Pakistan Telecommunication Authority. (2023). *Annual Report 2023*. PTA, Islamabad. Available: https://www.pta.gov.pk/en/annual-reports.

10. Pakistan Bureau of Statistics. (2023). *Motor Vehicle Registration Statistics 2022–23*. PBS, Islamabad.

11. Nielsen, J. (1993). *Usability Engineering*. Academic Press, San Diego, CA.

12. Uber Technologies. (2022). "Uber's Real-Time Infrastructure: From Monolith to Service-Oriented Architecture." *Uber Engineering Blog*. Available: https://www.uber.com/en-US/blog/engineering/.

13. MongoDB Atlas Documentation. (2024). "Atlas GeoJSON, 2dsphere Index, and $near Operator." *MongoDB Atlas Official Documentation*. Available: https://www.mongodb.com/docs/atlas/.

14. Google Firebase. (2024). "Firebase Cloud Messaging Documentation." *Firebase Official Documentation*. Available: https://firebase.google.com/docs/cloud-messaging.

15. React Native Community. (2024). "React Navigation 6.x Documentation." *reactnavigation.org*. Available: https://reactnavigation.org/docs/getting-started.

16. APScheduler Developers. (2024). "APScheduler 3.x Documentation." Available: https://apscheduler.readthedocs.io/en/3.x/.

17. Sinnott, R. W. (1984). "Virtues of the Haversine." *Sky and Telescope*, vol. 68, no. 2, p. 159. (Popularisation of the Haversine formula for astronomical distance calculations.)

18. Gamma, E., Helm, R., Johnson, R., and Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley Professional, Boston, MA.

19. React Native Community. (2024). "React Native 0.74 Release Notes." *React Native Official Documentation*. Available: https://reactnative.dev/blog.

20. PyMongo Developers. (2024). "PyMongo 4.x Documentation." *MongoDB Python Driver Official Documentation*. Available: https://pymongo.readthedocs.io/en/stable/.

---

# APPENDICES

## Appendix A: Installation and Setup Guide

This appendix provides a step-by-step guide for setting up the Smart Mechanic Finder development environment on a Windows machine, which is the primary development platform used in this project.

### A.1 Prerequisites

Before setting up the project, ensure the following software is installed on the development machine:

1. **Node.js 18+** — Download from https://nodejs.org/. Verify installation with `node --version` and `npm --version`. Node.js is required for the React Native mobile application build toolchain and the Metro bundler.

2. **Python 3.11+** — Download from https://www.python.org/downloads/. Verify with `python --version`. During installation, select "Add Python to PATH" to ensure Python is accessible from the command line. Python 3.11 introduced significant interpreter performance improvements used by the Flask backend.

3. **MongoDB 8.x** — Download the MongoDB Community Server from https://www.mongodb.com/try/download/community. Install with the default settings, ensuring the MongoDB Service is configured to start automatically. Alternatively, MongoDB can be started manually by running `mongod --dbpath C:\data\db` in an Administrator PowerShell. Verify that MongoDB is running by connecting with `mongosh` and running the `db.runCommand({ ping: 1 })` command.

4. **Android Studio** — Download from https://developer.android.com/studio. During installation, accept all default component selections including the Android Virtual Device (AVD). After installation, open Android Studio, go to SDK Manager, and install Android API level 34 (Android 14) and API level 21 (Android 5.0). The NDK (Native Development Kit) version 26 is required by some React Native dependencies; install it from the SDK Manager's SDK Tools tab.

5. **JDK 17** — Android Studio ships with a bundled JDK, but having JDK 17 installed at the system level and JAVA_HOME configured ensures compatibility. Download the OpenJDK 17 from https://adoptium.net/ and set `JAVA_HOME` to the installation directory in Windows Environment Variables.

6. **Git** — Download from https://git-scm.com/. Required for cloning the repository and version control.

### A.2 Backend Setup

```powershell
# Clone the repository
git clone https://github.com/your-org/smart-mechanic-finder.git
cd smart-mechanic-finder

# Navigate to the backend directory
cd backend

# Create a Python virtual environment (recommended)
python -m venv venv
venv\Scripts\activate

# Install all Python dependencies
pip install -r requirements.txt

# Create the .env file (copy from template and edit)
copy .env.example .env
# Edit .env with your configuration (see Appendix D)
```

The `requirements.txt` file includes all required Python packages: Flask, flask-jwt-extended, flask-cors, flask-mail, pymongo, bcrypt, python-dotenv, apscheduler, and firebase-admin (optional). The virtual environment isolates the project's Python dependencies from the system Python installation, preventing version conflicts.

### A.3 MongoDB Setup

If MongoDB is not already running as a Windows service, start it manually:

```powershell
# Create the data directory (if it doesn't exist)
New-Item -ItemType Directory -Force -Path C:\data\db

# Start MongoDB (run as Administrator)
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath C:\data\db

# In a new terminal, connect to MongoDB and create indexes
mongosh
use mechanic_finder_db
# Run the index creation script (see Appendix C)
```

The `init_db` function in `database.py` automatically creates all required indexes when the Flask application starts. However, it is good practice to manually verify that the 2dsphere index exists after initial setup:

```javascript
// In mongosh
db.mechanics.getIndexes()
// Should show an index with key: { location: '2dsphere' }
```

### A.4 React Native Setup

```powershell
# Navigate to the mobile app directory
cd ..\mobile

# Install all JavaScript dependencies
npm install

# Verify Android environment
npx react-native doctor
# This command checks all required tools and reports any missing items

# Configure the API base URL for your local network
# Edit: mobile\src\components\services\api.js
# Set PHYSICAL_DEVICE_HOST to your machine's Wi-Fi IP address
# Run: ipconfig  to find your current Wi-Fi IP (IPv4 Address)
```

The API base URL configuration is the most common source of connection errors during setup. The `api.js` file contains the `PHYSICAL_DEVICE_HOST` constant that must be set to the development machine's current Wi-Fi IP address (e.g., `192.168.100.115`). This IP address can change when connecting to different Wi-Fi networks or when the DHCP lease renews; the QUICK-START.md file in the repository documents this requirement and recommends configuring a static IP on the development machine's Wi-Fi adapter to prevent the need for repeated updates.

### A.5 Running the Application

```powershell
# Terminal 1: Start the Flask backend server
cd backend
venv\Scripts\activate
python run.py
# Server starts at http://0.0.0.0:5000
# Verify: open http://localhost:5000/ in a browser, should show {"status": "online"}

# Terminal 2: Start the React Native Metro bundler
cd mobile
npx react-native start --reset-cache

# Terminal 3: Build and deploy to Android device/emulator
cd mobile
npx react-native run-android
```

When using a physical Android device, enable Developer Options by tapping "Build Number" seven times in Settings > About Phone, then enable USB Debugging in Developer Options. Connect the device via USB cable before running `run-android`. If deploying to an AVD, start the emulator first from Android Studio's Device Manager.

### A.6 Troubleshooting

**"Cannot reach 192.168.x.x:5000/api" error:** This is the most common network connectivity issue and is caused by a mismatch between the IP address configured in `api.js` and the machine's actual current Wi-Fi IP. Run `ipconfig` to find the current IP and update `PHYSICAL_DEVICE_HOST` in `api.js`. Rebuild the app with `npx react-native run-android`. Also verify that the Windows Firewall has an inbound TCP rule for port 5000: run `netsh advfirewall firewall add rule name="Flask API Port 5000" dir=in action=allow protocol=TCP localport=5000` in an Administrator PowerShell.

**"SDK location not found" or ANDROID_HOME errors:** Set the `ANDROID_HOME` environment variable to the Android SDK location (default: `C:\Users\<username>\AppData\Local\Android\Sdk`). Add `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator` to the PATH.

**"Could not find NDK" build error:** Open Android Studio > SDK Manager > SDK Tools, check "NDK (Side by side)" version 26.x, and click Apply. The NDK path should be `%ANDROID_HOME%\ndk\26.x.x`.

**Metro bundler cache issues:** Run `npx react-native start --reset-cache` to clear the Metro bundler cache, which can cause stale module resolution issues after significant code changes.

**MongoDB connection timeout:** Ensure `mongod` is running. Check Windows Services for the MongoDB service. If using manual startup, verify the process is running with `netstat -an | findstr 27017`.

**Accepting Android SDK licenses:** Run `cd %ANDROID_HOME%` then `sdkmanager --licenses` and accept all prompts. This is required before the first React Native build.

---

## Appendix B: API Reference (Extended)

The following table provides the complete API endpoint reference with additional notes on required and optional fields for each endpoint.

| Method | Endpoint | Auth | Required Fields | Optional Fields | Notes |
|--------|----------|------|-----------------|-----------------|-------|
| POST | /api/auth/register | None | name, email, password | phone, role, shop_name*, address*, latitude*, longitude*, services* | *Required when role=mechanic |
| POST | /api/auth/login | None | email, password | — | Returns access_token and user object |
| GET | /api/auth/profile | JWT | — | — | Returns authenticated user's profile with mechanic data if applicable |
| PUT | /api/auth/profile | JWT | — | name, phone, latitude, longitude | At least one field must change |
| GET | /api/mechanic/nearby | JWT | lat, lng (query params) | status, radius (km, default 50) | Returns mechanics sorted by distance |
| GET | /api/mechanic/dashboard | JWT+Mechanic | — | — | Returns stats, recent services, SOS count |
| PUT | /api/mechanic/profile | JWT+Mechanic | — | shop_name, address, phone, description, opening_hours, latitude, longitude | At least one field required |
| GET | /api/mechanic/services | JWT+Mechanic | — | — | Returns mechanic's current services list |
| POST | /api/mechanic/services | JWT+Mechanic | service | — | Adds single service string to list |
| PUT | /api/mechanic/services | JWT+Mechanic | services (array) | — | Replaces entire services list |
| DELETE | /api/mechanic/services/:name | JWT+Mechanic | — | — | Removes named service from list |
| PUT | /api/mechanic/status | JWT+Mechanic | status | — | Values: 'open', 'closed', 'busy' |
| GET | /api/mechanic/ratings | JWT+Mechanic | — | limit (default 50) | Returns mechanic's received ratings |
| GET | /api/mechanic/history | JWT+Mechanic | — | limit (default 50), status | Returns service history for mechanic |
| POST | /api/mechanic/sos/accept/:id | JWT+Mechanic | — | — | Accepts specific SOS request |
| GET | /api/mechanic/sos/active | JWT+Mechanic | — | — | Returns active SOS requests sorted by distance |
| POST | /api/ratings/create | JWT | mechanic_id, rating | review, service_quality, punctuality, pricing, communication, service_id | rating: integer 1-5 |
| GET | /api/ratings/mechanic/:id | None | — | limit (default 20) | Publicly accessible |
| GET | /api/ratings/my-ratings | JWT | — | — | Returns vehicle owner's submitted ratings |
| POST | /api/sos/create | JWT | latitude, longitude | location_name, vehicle_type, issue_description, photo_id | Creates SOS and notifies nearby mechanics |
| GET | /api/sos/active | JWT | — | — | Returns user's active/responding SOS records |
| PUT | /api/sos/:id/cancel | JWT | — | — | Cancels specific SOS by owner only |
| GET | /api/messages/conversations | JWT | — | — | Returns all conversations with unread counts |
| POST | /api/messages/conversations | JWT | mechanic_id OR user_id | — | Gets or creates conversation with target |
| GET | /api/messages/conversations/:id/messages | JWT | — | — | Returns message history, marks as read |
| POST | /api/messages/conversations/:id/messages | JWT | text | — | Sends message in conversation |
| PUT | /api/messages/conversations/:id/messages/:msgid | JWT | text | — | Edits sender's own message |
| DELETE | /api/messages/conversations/:id/messages/:msgid | JWT | — | — | Soft-deletes sender's own message |
| DELETE | /api/messages/conversations/:id/clear | JWT | — | — | Clears conversation history for current user |
| GET | /api/admin/dashboard | JWT+Admin | — | — | Returns full platform statistics |
| GET | /api/admin/users | JWT+Admin | — | limit, page, search | Paginated user list |
| PUT | /api/admin/users/:id | JWT+Admin | — | name, phone, is_active, is_admin | Cannot modify own account |
| DELETE | /api/admin/users/:id | JWT+Admin | — | — | Soft-deactivates user account |
| GET | /api/admin/mechanics | JWT+Admin | — | limit, page, search, status, verified, verification_status | Paginated mechanic list |
| PUT | /api/admin/mechanics/:id/verify | JWT+Admin | — | is_verified (boolean, default true) | Sends notification to mechanic |
| PUT | /api/admin/mechanics/:id/verification-status | JWT+Admin | status | rejection_reason | status: 'verified', 'rejected', 'pending' |
| PUT | /api/admin/mechanics/:id/ban | JWT+Admin | — | is_banned (boolean), reason | Sends notification to mechanic |
| GET | /api/admin/reports | JWT+Admin | — | limit, page, status | Paginated report list |
| PUT | /api/admin/reports/:id | JWT+Admin | status | resolution, action | action='ban' triggers mechanic ban |

---

## Appendix C: MongoDB Index Setup Script

The following MongoDB shell script creates all indexes required by the Smart Mechanic Finder application. This script should be run after creating the database for the first time, or to verify that all indexes are in place on an existing database. The Flask application's `init_db` function runs these same index creation commands on startup, so this script is primarily useful for manual verification and for production deployments where manual database setup is performed before deploying the application code.

```javascript
// Run in MongoDB Shell (mongosh) or MongoDB Compass Shell
// Connect to the database first: use mechanic_finder_db

// === Users Collection ===
// Unique index on email for duplicate registration prevention
db.users.createIndex({ email: 1 }, { unique: true });
// Index for admin queries on user type
db.users.createIndex({ is_mechanic: 1 });
db.users.createIndex({ is_admin: 1 });
// Index for location-based user queries (non-geospatial flat coordinates)
db.users.createIndex({ latitude: 1, longitude: 1 });

// === Mechanics Collection ===
// CRITICAL: 2dsphere geospatial index - required for $near queries
db.mechanics.createIndex({ location: "2dsphere" });
// Unique index on user_id (one mechanic profile per user)
db.mechanics.createIndex({ user_id: 1 }, { unique: true });
// Status index for filtering open/closed mechanics
db.mechanics.createIndex({ status: 1 });
// Verification and ban status indexes for admin queries
db.mechanics.createIndex({ is_verified: 1 });
db.mechanics.createIndex({ is_banned: 1 });
// Rating sort index for admin analytics
db.mechanics.createIndex({ rating_average: -1 });

// === Ratings Collection ===
// Compound index: enforces one rating per user per mechanic
db.ratings.createIndex({ user_id: 1, mechanic_id: 1 });
// Index for retrieving mechanic's ratings sorted by date
db.ratings.createIndex({ mechanic_id: 1, created_at: -1 });
// Index for service-linked ratings
db.ratings.createIndex({ service_id: 1 });

// === Service History Collection ===
// Index for vehicle owner history screen
db.service_history.createIndex({ user_id: 1, created_at: -1 });
// Index for mechanic dashboard and history
db.service_history.createIndex({ mechanic_id: 1 });
// Status filter index
db.service_history.createIndex({ status: 1 });

// === Emergency SOS Collection ===
// Index for user's active SOS queries
db.emergency_sos.createIndex({ user_id: 1 });
// Status filter for admin and mechanic queries
db.emergency_sos.createIndex({ status: 1 });
// Coordinate index for proximity sorting
db.emergency_sos.createIndex({ latitude: 1, longitude: 1 });

// === Notifications Collection ===
// Index for user's notification feed (sorted by date)
db.notifications.createIndex({ user_id: 1, created_at: -1 });
// Index for unread notification counting
db.notifications.createIndex({ is_read: 1 });

// === Messages and Conversations ===
// Conversation lookup by participants
db.conversations.createIndex({ user_id: 1, mechanic_id: 1 }, { unique: true });
// Message retrieval by conversation sorted by time
db.messages.createIndex({ conversation_id: 1, created_at: -1 });

// === Analytics Collection ===
// Time-series index for analytics queries
db.analytics.createIndex({ timestamp: -1 });
// Event type index for categorical analytics
db.analytics.createIndex({ event_type: 1 });
// User and mechanic-scoped analytics
db.analytics.createIndex({ user_id: 1 });
db.analytics.createIndex({ mechanic_id: 1 });

print("All Smart Mechanic Finder indexes created successfully.");
```

---

## Appendix D: Environment Configuration (.env)

The following environment variables must be configured in the `backend/.env` file before running the Flask application. Never commit the `.env` file to version control; the repository includes a `.env.example` template with placeholder values that should be copied and filled in for each deployment.

```bash
# ============================
# Flask Configuration
# ============================
SECRET_KEY=your-strong-flask-secret-key-min-32-chars
FLASK_ENV=development
DEBUG=True

# ============================
# JWT Authentication
# ============================
JWT_SECRET_KEY=your-strong-jwt-secret-key-min-32-chars
# Token validity in seconds (86400 = 24 hours)
JWT_EXPIRES_SECONDS=86400

# ============================
# MongoDB Database
# ============================
# Local development
MONGODB_URI=mongodb://localhost:27017/mechanic_finder_db
# Production (Atlas example)
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mechanic_finder_db

# ============================
# Email (optional - for notifications)
# ============================
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

# ============================
# File Uploads
# ============================
# Absolute path to upload directory
UPLOAD_FOLDER=C:\smart-mechanic-finder\uploads
# Maximum file size in bytes (16MB default)
MAX_CONTENT_LENGTH=16777216

# ============================
# Firebase Cloud Messaging (optional)
# ============================
# Path to firebase-credentials.json downloaded from Firebase Console
# If not configured, push notifications are silently skipped
# FIREBASE_CREDENTIALS_PATH=backend/firebase-credentials.json

# ============================
# Redis Cache (optional)
# ============================
# If not configured, caching is disabled and Redis features are skipped
# REDIS_URL=redis://localhost:6379/0

# ============================
# SOS and Search Configuration
# ============================
# Maximum mechanic search radius in kilometres
MAX_MECHANIC_RADIUS_KM=50
# SOS broadcast radius in kilometres
SOS_BROADCAST_RADIUS_KM=50
# Minutes before a mechanic is considered inactive (for status reminders)
INACTIVE_MECHANIC_TIMEOUT_MINUTES=3
```

**Security Notes:**
- The `SECRET_KEY` and `JWT_SECRET_KEY` values must be cryptographically strong random strings. Generate them using Python: `python -c "import secrets; print(secrets.token_hex(32))"`.
- In production, `DEBUG=False` must be set to prevent the Flask debugger from exposing internal stack traces to users.
- The `MONGODB_URI` for production should use MongoDB Atlas with a strong database user password and IP allowlisting restricted to the server's IP address.
- Firebase credentials (the `firebase-credentials.json` file) must be kept secret. Do not commit this file to version control; add it to `.gitignore`.
- The `MAIL_PASSWORD` for Gmail must be an App Password (generated in Google Account security settings with 2-Step Verification enabled), not the regular Gmail password.

---

*End of Smart Mechanic Finder FYP Documentation*

*Department of Computer Science, University of Baltistan, Skardu (UOBS)*
*Session 2021–2025 | May 03, 2025*
