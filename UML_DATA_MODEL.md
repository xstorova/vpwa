# Návrh logického dátového modelu (UML Class Diagram)

Tento dátový model reprezentuje relačnú databázu pre semestrálnu prácu **Send light** (IRC / Slack štýl chatovacej aplikácie) podľa všetkých bodov zadania.

## 1. UML Class Diagram v Mermaid notácii

```mermaid
classDiagram
    direction TB

    class User {
        +BigInt id [PK]
        +String name
        +String nick [UNIQUE]
        +String email [UNIQUE]
        +String password_hash
        +UserStatus status
        +Boolean notify_only_mentions
        +Timestamp created_at
        +Timestamp updated_at
    }

    class Channel {
        +BigInt id [PK]
        +String name [UNIQUE]
        +ChannelType type
        +BigInt owner_id [FK]
        +Boolean is_group
        +String avatar_url
        +Timestamp last_activity_at
        +Timestamp created_at
        +Timestamp updated_at
    }

    class ChannelMember {
        +BigInt id [PK]
        +BigInt channel_id [FK]
        +BigInt user_id [FK]
        +Boolean is_banned
        +Boolean is_invited
        +Timestamp joined_at
    }

    class Message {
        +BigInt id [PK]
        +BigInt channel_id [FK]
        +BigInt sender_id [FK]
        +BigInt recipient_id [FK, NULL]
        +Text text
        +Timestamp created_at
    }

    class KickVote {
        +BigInt id [PK]
        +BigInt channel_id [FK]
        +BigInt target_user_id [FK]
        +BigInt voter_user_id [FK]
        +Timestamp created_at
    }

    class OfflineQueue {
        +BigInt id [PK]
        +BigInt message_id [FK]
        +BigInt recipient_user_id [FK]
        +Boolean is_delivered
        +Timestamp queued_at
    }

    class LiveDraft {
        +BigInt id [PK]
        +BigInt channel_id [FK]
        +BigInt user_id [FK]
        +Text draft_text
        +Timestamp updated_at
    }

    %% Relácie a kardinality
    User "1" -- "0..*" Channel : owns (owner_id)
    User "1" -- "0..*" ChannelMember : has membership
    Channel "1" -- "0..*" ChannelMember : has members
    Channel "1" -- "0..*" Message : contains
    User "1" -- "0..*" Message : sends (sender_id)
    User "0..1" -- "0..*" Message : mentioned (recipient_id)
    Channel "1" -- "0..*" KickVote : registered votes
    User "1" -- "0..*" KickVote : votes cast (voter_user_id)
    User "1" -- "0..*" KickVote : votes received (target_user_id)
    Message "1" -- "0..*" OfflineQueue : queued for delivery
    User "1" -- "0..*" OfflineQueue : pending for user
    Channel "1" -- "0..*" LiveDraft : active typing drafts
    User "1" -- "0..*" LiveDraft : writes draft
```

---

## 2. Pokrytie požiadaviek zadania v modeli

1. **Používateľ (`User`)**:
   - `name`: Meno a priezvisko (bod 26)
   - `nick`: Unikátna prezývka pre @adresovanie a príkazy (bod 26, 41)
   - `email`: Unikátny email na prihlasovanie
   - `status`: Online, Away, DND, Offline (body 52–55)
   - `notify_only_mentions`: Nastavenie notifikácií iba pre adresované správy (bod 51)

2. **Kanály (`Channel`)**:
   - `name`: Unikátny názov kanála (bod 41)
   - `type`: `public` alebo `private` (bod 31)
   - `owner_id`: Správca kanála, ktorý ho vytvoril (bod 32)
   - `last_activity_at`: Dátum a čas poslednej pridanej správy; kanál po 30 dňoch inaktivity zaniká a názov sa uvoľní (bod 33)

3. **Členstvo a pozvánky (`ChannelMember`)**:
   - `is_invited`: Indikátor pozvánky – topovanie a zvýraznenie v UI (bod 29)
   - `is_banned`: Permanentný ban po 3 kick-hlasoch alebo vyhodení správcom (bod 40)

4. **Správy a adresovanie (`Message`)**:
   - `sender_id`: Autor správy
   - `recipient_id`: Voliteľný cudzí kľúč pri adresovaní konkrétnemu používateľovi cez `@nickname` (body 44–45)
   - `text`: Text správy

5. **Hlasovanie o vyhodení (`KickVote`)**:
   - Uchováva hlasy členov verejného kanála (`/kick nick`). Pri dosiahnutí 3 hlasov sa používateľovi nastaví trvalý ban (bod 40).

6. **Offline fronta (`OfflineQueue`)**:
   - Uchováva správy doručené v čase, keď bol príjemca v stave Offline (bod 55). Po prechode do Online sa správy doručia.

7. **Živé rozpísané správy (`LiveDraft`)**:
   - Podpora pre real-time náhľad textu rozpísanej správy pred odoslaním (body 57–58).

---

## 3. Ako vyexportovať JPG pre odovzdanie do AISu:

1. Otvorte stránku **[https://mermaid.live](https://mermaid.live)**.
2. Do ľavého okna vložte kód z bloku `mermaid` vyššie.
3. Vpravo dole kliknite na **Actions -> Download JPEG (alebo PNG)**.
4. Uložte súbor ako `uml_data_model.jpg` a priložte ho do odovzdávaného ZIP archívu.
