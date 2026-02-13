--
-- PostgreSQL database dump
--

\restrict XC995I8lLKAWlA1RYix3q2i7j0Wxh0yyVAR36BTH7Q3PyvJSZe4LdaW6rXVmX7G

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-13 05:47:40

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 57359)
-- Name: anc_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.anc_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    beneficiary_id integer NOT NULL,
    form_id uuid,
    month_number integer NOT NULL,
    data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 40968)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id uuid,
    action character varying(255),
    beneficiary_id integer,
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 228 (class 1259 OID 40967)
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 228
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- TOC entry 226 (class 1259 OID 24598)
-- Name: beneficiaries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beneficiaries (
    id integer NOT NULL,
    govt_id character varying(255),
    name character varying(255) NOT NULL,
    age integer,
    contact_number character varying(255),
    edd date,
    state character varying(255) DEFAULT 'Maharashtra'::character varying,
    district character varying(255),
    block character varying(255),
    village character varying(255),
    is_data_complete boolean DEFAULT false,
    medical_fields jsonb,
    assigned_asha_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'active'::text,
    is_high_risk boolean DEFAULT false,
    registration_source text DEFAULT 'govt_sync'::text,
    current_phase text DEFAULT 'antenatal'::text,
    CONSTRAINT beneficiaries_current_phase_check CHECK ((current_phase = ANY (ARRAY['antenatal'::text, 'postnatal'::text, 'child_care'::text]))),
    CONSTRAINT beneficiaries_registration_source_check CHECK ((registration_source = ANY (ARRAY['govt_sync'::text, 'asha_manual'::text]))),
    CONSTRAINT beneficiaries_status_check CHECK ((status = ANY (ARRAY['active'::text, 'delivered'::text, 'follow-up'::text])))
);


--
-- TOC entry 225 (class 1259 OID 24597)
-- Name: beneficiaries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.beneficiaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 225
-- Name: beneficiaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.beneficiaries_id_seq OWNED BY public.beneficiaries.id;


--
-- TOC entry 227 (class 1259 OID 32768)
-- Name: forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    phase character varying(255) NOT NULL,
    schema jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    month_number integer[],
    is_recurring boolean DEFAULT false,
    sort_order integer DEFAULT 0
);


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 219
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- TOC entry 222 (class 1259 OID 16398)
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


--
-- TOC entry 221 (class 1259 OID 16397)
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 221
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- TOC entry 231 (class 1259 OID 65536)
-- Name: schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    beneficiary_id integer NOT NULL,
    form_id uuid,
    scheduled_date date NOT NULL,
    status character varying(255) DEFAULT 'planned'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 16427)
-- Name: token_blacklist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_blacklist (
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    blacklisted_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 223 (class 1259 OID 16405)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role text NOT NULL,
    full_name character varying(255) NOT NULL,
    village character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reset_password_token character varying(255),
    reset_password_expires timestamp with time zone,
    contact_number character varying(20),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'asha'::text, 'parent'::text])))
);


--
-- TOC entry 4913 (class 2604 OID 40971)
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 24601)
-- Name: beneficiaries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beneficiaries ALTER COLUMN id SET DEFAULT nextval('public.beneficiaries_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 16393)
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 16401)
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- TOC entry 5116 (class 0 OID 57359)
-- Dependencies: 230
-- Data for Name: anc_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.anc_records (id, beneficiary_id, form_id, month_number, data, created_at, updated_at) FROM stdin;
926f7f74-c251-4f9d-96f0-24a6a9b51abb	1	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	1	{"oedema": ["Entire Body"], "bp_systolic": "45", "urine_sugar": "2+", "bp_diastolic": "54", "urine_albumin": "2+", "new_complaints": ["Fetus is not moving"], "foetus_movement": "Increased", "breast_examination": ["Breast Lump"], "visited_other_facility": "Yes", "other_facilities_visited": ["Medical College"]}	2026-01-04 13:14:31.020934+05:30	2026-01-04 13:14:31.020934+05:30
d30b2047-e747-4c9e-9ff3-86bd08ed8689	1	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	4	{"oedema": ["Entire Body"], "bp_systolic": "50", "urine_sugar": "2+", "bp_diastolic": "50", "urine_albumin": "2+", "new_complaints": ["Fetus is not moving"], "foetus_movement": "Increased", "breast_examination": ["Breast Lump"], "visited_other_facility": "Yes", "other_facilities_visited": ["Medical College"]}	2026-01-04 13:17:01.427022+05:30	2026-01-04 13:17:01.427022+05:30
9cec16f4-a6db-4a1f-8fcb-1dd0951edb1d	1	83831d98-1148-4399-beb0-77a0b96c3d17	1	{"vaccine_list": ["BCG", "Polio (OPV/IPV)"], "vaccine_status": "Completed", "vaccination_timestamp": "2026-01-02T10:31"}	2026-01-04 13:18:43.551186+05:30	2026-01-04 13:18:43.551186+05:30
2d724963-4318-4f0d-8048-5a744ae88384	63	098078f9-a766-4dea-be28-cf7ef65c3676	0	{"height_cm": "143", "weight_kg": "44", "risk_indicators": ["Persistent Diarrhea"], "visit_timestamp": "2026-01-03T13:41"}	2026-01-03 13:41:38.175747+05:30	2026-01-03 13:41:38.175747+05:30
98eb8550-8add-4120-b93e-4505d46ed708	39	ad926a42-4a7d-4331-bf06-745e605bcb67	0	{"gender": "Male", "blood_group": "A-", "cry_at_birth": "Yes", "date_of_birth": "2025-11-30", "delivery_type": "Normal", "time_of_birth": "14:22", "babys_full_name": "Raj son", "birth_length_cm": "45", "birth_weight_kg": "1", "place_of_delivery": "mh"}	2026-01-01 14:22:32.439501+05:30	2026-01-01 21:28:23.38917+05:30
3c52699f-c4c0-4c17-8611-28f46d05381d	61	098078f9-a766-4dea-be28-cf7ef65c3676	1	{"height_cm": "199", "weight_kg": "100", "risk_indicators": ["Oedema both feet"], "visit_timestamp": "2026-01-02T22:19"}	2026-01-02 10:19:21.310036+05:30	2026-01-02 10:19:47.352192+05:30
54dcd383-a145-49a6-8709-c875f94fdd46	74	33254d64-61ab-4e0f-b333-7cc315093a8c	0	{"pulse_bpm": "36.1", "does_mother_has_seizures_": "Yes", "does_mother_has_less_breast_milk": "Yes", "blood_pressure_systolic_mm_hg90100": "89", "blood_pressure_diastolic_mm_hg90100": "99", "is_there_foul_smelling_discharge_pv": "Yes", "mother_examination__temperature_c_361378": "36.1", "basic_details__is_mother_suffering_from_any_of_the_following__": ["No"], "refer_the_mother_immediately_to_hospital_did_arrangement_was_made__": ["Mother was not ready to go to hospital"], "does_mother_has_any_breast_related_issue_like_swelling_cracked_nipple_etc_": "Yes"}	2026-01-10 17:35:34.034222+05:30	2026-01-10 17:41:42.290408+05:30
0c0c57b0-f9e3-4387-be4e-528d44124180	61	83831d98-1148-4399-beb0-77a0b96c3d17	1	{"vaccine_status": "Partial (Stock Out)", "vaccination_timestamp": "2026-01-02T10:20"}	2026-01-02 10:20:09.192866+05:30	2026-01-02 10:20:41.111513+05:30
af0e8a7b-c394-4bfd-af09-b0c63dcc9b06	61	098078f9-a766-4dea-be28-cf7ef65c3676	0	{"height_cm": "124", "weight_kg": "48", "risk_indicators": ["Visible Wasting", "Oedema both feet"], "visit_timestamp": "2026-01-02T10:24"}	2026-01-02 10:24:41.10288+05:30	2026-01-02 10:24:41.10288+05:30
05dbba23-821c-4823-a8f8-c7e4846a5f6f	61	d4d5c14f-7588-480b-8ed5-94fe3f40cd50	0	{"assessment_date": "2026-01-02T10:26", "milestone_status": "On Track", "physical_milestones": ["Sits without support (6m)"], "social_cognitive_milestones": ["Responds to own name (6m)"]}	2026-01-02 10:26:58.741455+05:30	2026-01-02 10:26:58.741455+05:30
e77a6444-03bb-4cb1-ae5c-ac716c5f3dac	1	d4d5c14f-7588-480b-8ed5-94fe3f40cd50	0	{"assessment_date": "2026-01-02T10:54", "milestone_status": "On Track", "physical_milestones": ["Holds head steady (4m)"]}	2026-01-02 10:54:59.381254+05:30	2026-01-02 10:54:59.381254+05:30
de698814-2b31-4bd3-9097-31c76cadfdc0	1	83831d98-1148-4399-beb0-77a0b96c3d17	0	{"vaccine_list": ["BCG"], "vaccine_status": "Partial (Stock Out)", "vaccination_timestamp": "2026-01-02T10:31"}	2026-01-02 10:31:21.881457+05:30	2026-01-04 13:19:21.360734+05:30
aa6ff4f9-6916-4132-b2c5-02b96cd8e63b	1	83831d98-1148-4399-beb0-77a0b96c3d17	1	{"vaccine_list": ["Polio (OPV/IPV)", "Pentavalent"], "vaccine_status": "Completed", "vaccination_timestamp": "2026-01-02T10:59"}	2026-01-02 11:00:02.039006+05:30	2026-01-02 11:00:02.039006+05:30
9742b729-1fd9-41ba-9190-ca985d0392d0	1	098078f9-a766-4dea-be28-cf7ef65c3676	1	{"height_cm": "140", "weight_kg": "79", "risk_indicators": ["Severe Paleness"], "visit_timestamp": "2026-01-23T11:01"}	2026-01-01 21:59:15.741679+05:30	2026-01-02 11:01:40.047673+05:30
0fb69843-553c-4259-81d4-c1efce8362e1	121	ad926a42-4a7d-4331-bf06-745e605bcb67	0	{"gender": "Male", "blood_group": "B-", "cry_at_birth": "Yes", "date_of_birth": "2025-12-29", "delivery_type": "Normal", "time_of_birth": "14:32", "babys_full_name": "BABY TEST", "birth_length_cm": "142", "birth_weight_kg": "4", "place_of_delivery": "xyz"}	2026-01-04 14:30:20.68447+05:30	2026-01-04 14:30:20.68447+05:30
4e794818-e912-4e14-988d-ee7262a85db9	128	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	1	{"oedema": ["Pedal"], "ifa_given": "No", "bp_systolic": "90", "urine_sugar": "1+", "bp_diastolic": "50", "calcium_given": "Yes", "urine_albumin": "Trace", "new_complaints": ["Headache"], "foetus_movement": "Increased", "folic_acid_given": "Yes", "breast_examination": ["Normal nipple"], "visited_other_facility": "Yes", "other_facilities_visited": ["CHC"]}	2026-01-04 14:33:50.703171+05:30	2026-01-04 14:33:50.703171+05:30
114799ed-e25c-4a5c-afdc-e61517047c2c	128	dd489f04-9d27-4ff5-8a46-384181174cb1	1	{"patient_full_name": "XYX"}	2026-01-04 14:34:34.50018+05:30	2026-01-04 14:34:34.50018+05:30
192683b9-6652-43eb-bcc3-03d8fb447230	2	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	1	{"oedema": ["Entire Body"], "ifa_given": "Yes", "bp_systolic": "78", "urine_sugar": "4+", "bp_diastolic": "87", "urine_albumin": "1+", "new_complaints": ["Breathing Difficulty"], "foetus_movement": "Decreased", "folic_acid_given": "Yes", "breast_examination": ["Normal nipple"], "visited_other_facility": "Yes"}	2026-01-03 14:26:42.581697+05:30	2026-01-03 14:26:42.581697+05:30
52d2f968-31c1-467a-b24c-9b280174464c	1	ad926a42-4a7d-4331-bf06-745e605bcb67	0	{"gender": "Female", "blood_group": "B+", "cry_at_birth": "Yes", "date_of_birth": "2026-01-03", "delivery_type": "C-Section", "time_of_birth": "15:36", "babys_full_name": "baby temop", "birth_length_cm": "143", "birth_weight_kg": "48", "place_of_delivery": "bfdh"}	2026-01-03 15:33:35.614409+05:30	2026-01-03 15:33:35.614409+05:30
8d26818a-a967-4a17-bf91-f76b56ef5896	128	098078f9-a766-4dea-be28-cf7ef65c3676	1	{"height_cm": "144", "weight_kg": "4", "risk_indicators": ["Visible Wasting"], "visit_timestamp": "2025-12-29T14:35"}	2026-01-04 14:35:20.918128+05:30	2026-01-04 14:35:20.918128+05:30
f2b0c079-f4ad-480f-8d2d-84db3ba468e8	128	83831d98-1148-4399-beb0-77a0b96c3d17	1	{"vaccine_list": ["BCG"], "vaccine_status": "Completed", "vaccination_timestamp": "2026-01-01T14:36"}	2026-01-04 14:36:51.148801+05:30	2026-01-04 14:36:51.148801+05:30
b17bb61c-93ef-486b-afc8-8d2b6060fff0	128	83831d98-1148-4399-beb0-77a0b96c3d17	1	{"vaccine_list": ["Polio (OPV/IPV)", "Pentavalent"], "vaccine_status": "Completed", "vaccination_timestamp": "2025-12-31T14:37"}	2026-01-04 14:37:20.232196+05:30	2026-01-04 14:37:20.232196+05:30
aadbe7b4-4a52-4d17-acaf-cc6f552cfd90	37	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	4	{"oedema": ["Entire Body"], "bp_systolic": "179", "urine_sugar": "Trace", "bp_diastolic": "201", "urine_albumin": "Trace", "new_complaints": ["Breathing Difficulty"], "foetus_movement": "No movement", "folic_acid_given": "Yes", "breast_examination": ["Bloody nipple discharge"], "visited_other_facility": "Yes"}	2026-01-10 18:18:44.377013+05:30	2026-01-10 18:18:44.377013+05:30
b8cfe772-2df6-493b-b11a-6837eef04dad	37	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	1	{"oedema": ["Entire Body"], "bp_systolic": "90", "urine_sugar": "Trace", "bp_diastolic": "100", "urine_albumin": "Trace", "new_complaints": ["Breathing Difficulty"], "foetus_movement": "No movement", "folic_acid_given": "Yes", "breast_examination": ["Bloody nipple discharge"], "visited_other_facility": "Yes"}	2026-01-10 18:14:09.336395+05:30	2026-01-10 18:23:26.418628+05:30
9a0b5e3f-756d-4bf3-b066-fec61ffcec20	128	dd489f04-9d27-4ff5-8a46-384181174cb1	2	{"patient_full_name": "XYX"}	2026-01-24 07:50:32.745797+05:30	2026-01-24 07:50:32.745797+05:30
\.


--
-- TOC entry 5115 (class 0 OID 40968)
-- Dependencies: 229
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, beneficiary_id, old_data, new_data, created_at) FROM stdin;
\.


--
-- TOC entry 5112 (class 0 OID 24598)
-- Dependencies: 226
-- Data for Name: beneficiaries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.beneficiaries (id, govt_id, name, age, contact_number, edd, state, district, block, village, is_data_complete, medical_fields, assigned_asha_id, created_at, updated_at, status, is_high_risk, registration_source, current_phase) FROM stdin;
37	1	Anjali Sharma	24	9876543210	2025-05-18	Maharashtra	Pune	Khed	Chakan	t	{"history": "Anaemic", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-27 02:57:22.908156+05:30	2026-01-11 22:04:34.981232+05:30	active	f	govt_sync	antenatal
2	W-002	Priya Patil	35	9876543211	2025-06-13	Maharashtra	Pune	Haveli	Wagholi	t	{"history": "High Blood Pressure", "blood_group": "Unknown"}	3a19620f-fc9e-4432-a7de-462ea31b5349	2025-12-26 17:55:06.097912+05:30	2025-12-27 12:04:57.356159+05:30	active	f	govt_sync	antenatal
1	W-001	Anjali Sharma	24	9876543210	\N	Maharashtra	Pune	Khed	Wagholi	t	{"history": "Anaemic", "blood_group": "Unknown"}	3a19620f-fc9e-4432-a7de-462ea31b5349	2025-12-26 17:55:06.097912+05:30	2026-01-10 12:56:45.914927+05:30	active	f	govt_sync	antenatal
61	4	Anjali Sharma	24	9876543210	2025-05-20	Maharashtra	\N	\N	Chakan	t	{"history": "Anaemic", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-27 03:12:16.657658+05:30	2025-12-27 03:12:16.657658+05:30	active	f	govt_sync	antenatal
74	W-004	Kavita Deshmukh	31	9876543213	2026-01-10	Maharashtra	\N	\N	Raipur	t	{"history": "Anaemic", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-27 09:38:56.26978+05:30	2025-12-27 09:38:56.26978+05:30	active	f	govt_sync	antenatal
75	W-005	Meena Jadhav	22	9876543214	2026-01-10	Maharashtra	\N	\N	Pangaon	t	{"history": "None", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-27 09:38:56.26978+05:30	2025-12-27 09:38:56.26978+05:30	active	f	govt_sync	antenatal
38	2	Priya Patil	35	9876543211	2025-06-15	Maharashtra	Pune	Haveli	Wagholi	t	{"history": "High Blood Pressure", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-27 02:57:22.908156+05:30	2025-12-27 02:57:22.908156+05:30	active	f	govt_sync	antenatal
76	W-006	Pooja More	26	9876543215	2026-01-28	Maharashtra	\N	\N	Belapur	t	{"history": "Thyroid", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-27 09:38:56.26978+05:30	2026-01-10 16:51:58.175035+05:30	active	f	govt_sync	antenatal
9	W-003	Sunita Kale	28	9876543212	2026-01-07	Maharashtra	Pune	Haveli	Wavi	t	{"history": "Gestational Diabetes", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-26 18:05:46.139669+05:30	2026-01-10 16:55:10.659128+05:30	active	t	govt_sync	antenatal
63	6	Rajeshwari atil	29	7639782928	2025-05-20	Maharashtra	\N	\N	Wagholi	t	{"history": "High Blood Pressure", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-27 03:12:16.657658+05:30	2025-12-27 03:12:16.657658+05:30	active	f	govt_sync	antenatal
39	3	Rajeshwari atil	29	7639782928	2026-01-02	\N	Pune	Haveli	Wagholi Chakan Pune	f	{"history": "High Blood Pressure", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-27 02:57:22.908156+05:30	2026-01-10 16:55:28.347096+05:30	active	f	govt_sync	antenatal
62	5	Priya Patil	35	9876543211	2025-06-14	Maharashtra	\N	\N	Chakan	t	{"history": "High Blood Pressure", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2025-12-27 03:12:16.657658+05:30	2025-12-29 13:50:18.5879+05:30	active	f	govt_sync	antenatal
103	7	Sunita More	22	9988776655	2025-08-11	Maharashtra	\N	\N	Paud	t	{"history": "Normal", "blood_group": "Unknown"}	475b3022-e144-4759-b934-2c0d0b77fc2d	2026-01-03 14:06:10.300203+05:30	2026-01-03 15:31:33.802079+05:30	active	f	govt_sync	antenatal
80	W-010	Vaishali Gadgil	40	8899001122	\N	Maharashtra	\N	\N	Nasrapur	t	{"history": "Thyroid issues", "blood_group": "Unknown"}	475b3022-e144-4759-b934-2c0d0b77fc2d	2025-12-27 09:38:56.26978+05:30	2026-01-04 14:14:09.3787+05:30	active	f	govt_sync	antenatal
78	W-008	Rekha Pawar	29	9876543217	2026-01-10	Maharashtra	\N	\N	Kupwad	t	{"history": "Anaemic", "blood_group": "Unknown"}	3a19620f-fc9e-4432-a7de-462ea31b5349	2025-12-27 09:38:56.26978+05:30	2026-01-10 13:20:54.565792+05:30	active	f	govt_sync	antenatal
105	9	Meera Kulkarni	19	9822334455	2026-01-04	Maharashtra	\N	\N	Narayangaon	t	{"history": "Underweight, Not eligibile to talk", "blood_group": "Unknown"}	3a19620f-fc9e-4432-a7de-462ea31b5349	2026-01-03 14:06:10.300203+05:30	2026-01-04 12:43:22.613816+05:30	active	f	govt_sync	antenatal
95	\N	Sunita Devi	39	7845123265	2025-12-31	Maharashtra	\N	\N	Nandurbar	t	\N	924dc428-da5e-4594-9043-a67c1e407003	2025-12-29 00:30:52.404924+05:30	2025-12-29 16:00:37.382223+05:30	active	t	govt_sync	antenatal
77	W-007	Neha Kulkarni	34	9876543216	2026-01-10	Maharashtra	Nagar	Vilaspur	Kasaba Bawada	t	{"history": "High Blood Pressure", "blood_group": "Unknown"}	3a19620f-fc9e-4432-a7de-462ea31b5349	2025-12-27 09:38:56.26978+05:30	2026-01-10 16:50:08.962867+05:30	active	f	govt_sync	antenatal
104	8	Kavita Deshmukh	31	9123456789	2025-09-05	Maharashtra	\N	\N	Lonavala	t	{"history": "Gestational Diabetes", "blood_group": "Unknown"}	3a19620f-fc9e-4432-a7de-462ea31b5349	2026-01-03 14:06:10.300203+05:30	2026-01-03 14:06:10.300203+05:30	active	f	govt_sync	antenatal
79	W-009	Rukmini Shinde	27	7766554433	2025-07-30	Maharashtra	\N	\N	Shikrapur	t	{"history": "Twin Pregnancy", "blood_group": "Unknown"}	3a19620f-fc9e-4432-a7de-462ea31b5349	2025-12-27 09:38:56.26978+05:30	2025-12-27 13:13:45.751817+05:30	active	f	govt_sync	antenatal
108	W-011	Fatima Sheikh	26	9011223344	2025-12-01	Maharashtra	\N	\N	Manchar	t	{"history": "Previous C-Section", "blood_group": "Unknown"}	3a19620f-fc9e-4432-a7de-462ea31b5349	2026-01-03 14:06:10.300203+05:30	2026-01-03 14:06:10.300203+05:30	active	f	govt_sync	antenatal
109	W-012	Deepali Joshi	28	9545352515	2026-01-09	Maharashtra	\N	\N	Saswad	t	{"history": "Asthmatic", "blood_group": "Unknown"}	924dc428-da5e-4594-9043-a67c1e407003	2026-01-03 14:06:10.300203+05:30	2026-01-03 15:31:21.682735+05:30	active	f	govt_sync	antenatal
156	W-017	Priyanka Mane	32	8800112233	2026-05-08	Maharashtra	Pune	Daund	Patas	t	{"history": "anaemic", "blood_group": "Unknown"}	475b3022-e144-4759-b934-2c0d0b77fc2d	2026-01-10 16:26:21.991442+05:30	2026-01-10 16:48:13.114701+05:30	active	t	govt_sync	antenatal
139	W-020	Suman Patil	38	9822001122	2026-04-11	Maharashtra	Pune	Mulshi	Paud	t	{"history": "Hypertension", "blood_group": "Unknown"}	\N	2026-01-10 13:55:13.53928+05:30	2026-01-10 16:50:32.325359+05:30	active	t	govt_sync	antenatal
117	1245	Nirmami	47	7845123265	2026-01-02	Maharashtra	\N	\N	Nandurbar	t	\N	e650b9a8-61e8-4f27-8211-4d650cd05936	2026-01-04 12:44:32.157056+05:30	2026-01-04 13:00:57.250033+05:30	active	t	asha_manual	antenatal
166	4545	test	14	9874585854	2026-01-11	Maharashtra	Nashik	Malegaon	dh	t	{"history": "NA", "blood_group": "A+"}	3a19620f-fc9e-4432-a7de-462ea31b5349	2026-01-11 14:50:22.227058+05:30	2026-01-11 21:53:49.174285+05:30	active	f	asha_manual	antenatal
152	G107	Mangala	39	9874562500	2026-02-06	Maharashtra	Nashik	Malegaon	Vadgaon	t	\N	924dc428-da5e-4594-9043-a67c1e407003	2026-01-10 16:17:16.122314+05:30	2026-01-10 16:17:16.122314+05:30	active	f	asha_manual	antenatal
128	W-122	testing meet beneficiary	39	7845123265	2026-01-29	Maharashtra	\N	\N	Nandurbar	t	\N	924dc428-da5e-4594-9043-a67c1e407003	2026-01-04 14:32:53.125553+05:30	2026-01-10 13:39:24.842141+05:30	active	t	asha_manual	antenatal
153	3948	Testing Medical 	39	1456789820	2026-01-17	Maharashtra	Nashik	Malegaon	Bilpuri	t	{"history": "anemic", "blood_group": "A+"}	924dc428-da5e-4594-9043-a67c1e407003	2026-01-10 16:21:57.54227+05:30	2026-01-10 16:21:57.54227+05:30	active	f	asha_manual	antenatal
118	W-015	Anjali Thorat	24	9850123456	2026-01-11	\N	Pune	Haveli	Wagholi	f	{"history": "Normal", "blood_group": "Unknown"}	475b3022-e144-4759-b934-2c0d0b77fc2d	2026-01-04 12:59:39.33751+05:30	2026-01-04 14:16:08.136113+05:30	active	t	govt_sync	antenatal
119	W-016	Sarika Pawar	29	9765432109	2026-01-18	\N	Pune	Khed	Chakan	f	{"history": "Normal", "blood_group": "Unknown"}	e650b9a8-61e8-4f27-8211-4d650cd05936	2026-01-04 12:59:39.33751+05:30	2026-01-04 12:59:39.33751+05:30	active	f	govt_sync	antenatal
121	W-018	Lata Gaikwad	17	7020304050	2026-06-15	\N	Pune	Mulshi	Pirangut	f	{"history": "Normal", "blood_group": "Unknown"}	\N	2026-01-04 12:59:39.33751+05:30	2026-01-04 14:19:46.742829+05:30	active	t	govt_sync	antenatal
122	W-019	Neha Kadam	27	9422556677	2026-07-20	\N	Pune	Velhe	Panshet	f	{"history": "Normal", "blood_group": "Unknown"}	475b3022-e144-4759-b934-2c0d0b77fc2d	2026-01-04 12:59:39.33751+05:30	2026-01-04 13:08:08.118626+05:30	active	f	govt_sync	antenatal
\.


--
-- TOC entry 5113 (class 0 OID 32768)
-- Dependencies: 227
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.forms (id, title, phase, schema, is_active, created_at, updated_at, month_number, is_recurring, sort_order) FROM stdin;
ad926a42-4a7d-4331-bf06-745e605bcb67	New Born Registration	postnatal	[{"id": 1767247725735, "name": "babys_full_name", "type": "text", "label": "Baby's Full Name", "options": [], "required": true}, {"id": 1767247753228, "name": "date_of_birth", "type": "date", "label": "Date of Birth", "options": [], "required": true}, {"id": 1767247792406, "name": "time_of_birth", "type": "time", "label": "Time of Birth", "options": [], "required": true}, {"id": 1767247800542, "name": "gender", "type": "select", "label": "Gender", "options": ["Male", "Female", "Other"], "required": true}, {"id": 1767247825014, "name": "birth_weight_kg", "type": "number", "label": "Birth Weight (kg)", "options": [], "required": true}, {"id": 1767247852471, "name": "place_of_delivery", "type": "text", "label": "Place of Delivery", "options": [], "required": true}, {"id": 1767247860520, "name": "delivery_type", "type": "select", "label": "Delivery Type", "options": ["Normal", "C-Section", "Assisted"], "required": false}, {"id": 1767247877600, "name": "blood_group", "type": "select", "label": "Blood Group", "options": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], "required": false}, {"id": 1767247893713, "name": "birth_length_cm", "type": "number", "label": "Birth Length (cm)", "options": [], "required": true}, {"id": 1767247902417, "name": "cry_at_birth", "type": "select", "label": "Cry at Birth?", "options": ["Yes", "No"], "required": false}]	t	2026-01-01 11:42:19.136773+05:30	2026-01-01 11:42:19.136773+05:30	{NULL}	f	0
e95a0f27-aecb-42d0-8057-05464215d44b	ANC Clinic Visit	antenatal	[{"id": 1767266836996, "name": "anthropometry__weight_kg_1100", "type": "number", "label": "Anthropometry - Weight (kg) (1-100))", "options": [], "required": true}, {"id": 1767267077497, "name": "anthropometry__bmi_kgm_185249", "type": "number", "label": "Anthropometry - BMI (kg/m²) (18.5-24.9)", "options": [], "required": true}, {"id": 1767267124971, "name": "basic_details__blood_pressure_systolic_mm_hg_90140_", "type": "number", "label": "Basic Details - Blood Pressure (systolic) (mm Hg) (90-140) ", "options": [], "required": true}, {"id": 1767267179372, "name": "basic_details__blood_pressure_diastolic_mm_hg_5090_", "type": "number", "label": "Basic Details - Blood Pressure (Diastolic) (mm Hg) (50-90) ", "options": [], "required": true}, {"id": 1767267206653, "name": "is_mosquito_net_given_", "type": "select", "label": "Is mosquito net given ?", "options": ["Yes", "No"], "required": false}, {"id": 1767267227822, "name": "is_safe_delivery_kit_given__", "type": "select", "label": "Is safe delivery kit given ? ", "options": ["Yes", "No"], "required": false}, {"id": 1767267262119, "name": "history_and_physical_exam__new_complaint", "type": "checkbox", "label": "History and Physical Exam - New Complaint", "options": ["Breathing Difficulty", "Fetus is not moving", "Headache", "Blured Vision", "Pain in abdomen", "Sweeling on Face /Abdomen/ Whole Body", "Burning Micturition", "Bleeding PV", "Fever", "Vomiting", "Other", "None"], "required": true}, {"id": 1767267418636, "name": "oedema", "type": "checkbox", "label": "Oedema", "options": ["Pedal", "Vulval", "Face", "Entire Body", "No oedema"], "required": true}, {"id": 1767267454965, "name": "abdomen_check", "type": "checkbox", "label": "Abdomen Check", "options": ["Hydroamniosis", "Twins", "Previous C-Section Scar", "Hydroamniosis/Twins", "None"], "required": true}, {"id": 1767267542137, "name": "current_gestational_age_weeks", "type": "number", "label": "Current Gestational age (weeks)", "options": [], "required": false}, {"id": 1767267570808, "name": "fundle_height", "type": "select", "label": "Fundle Height", "options": ["12-14", "14-16", "16-18", "18-20", "20-22", "22-24", "24-26", "26-28", "28-30", "30-32", "32-34", "34-36", "36-38", "38-40", "NA"], "required": true}, {"id": 1767267683885, "name": "position", "type": "select", "label": "Position", "options": ["Vertex", "Breach", "Transverse", "NA"], "required": true}, {"id": 1767267711573, "name": "fhs_not_audiblecant_locate_audible_na_fhs_number", "type": "text", "label": "FHS (Not audible/Can't locate, Audible, NA, FHS NUMBER)", "options": [], "required": true}, {"id": 1767267740822, "name": "foetus_movement", "type": "select", "label": "Foetus Movement", "options": ["No movement", "Increased", "Decreased", "As it is", "NA"], "required": true}, {"id": 1767267777504, "name": "breast_examination", "type": "checkbox", "label": "Breast Examination", "options": ["Normal nipple", "Rectracted nipple", "Breast Lump", "Bloody nipple discharge", "Mastitis"], "required": true}, {"id": 1767267922011, "name": "lab_investigation__urine_albumin", "type": "select", "label": "Lab Investigation - Urine Albumin", "options": ["Trace", "1+", "2+", "3+", "4+", "Nil"], "required": true}, {"id": 1767267973053, "name": "lab_investigation__urine_sugar", "type": "select", "label": "Lab Investigation - Urine Sugar", "options": ["Trace", "1+", "2+", "3+", "4+", "Nil"], "required": true}, {"id": 1767268007671, "name": "lab_investigation__haemoglobin_gdl_12155", "type": "number", "label": "Lab Investigation - Haemoglobin (g/dl) (12-15.5))", "options": [], "required": true}, {"id": 1767268055648, "name": "urine_microscopy__pus_cell", "type": "number", "label": "Urine Microscopy - Pus Cell", "options": [], "required": false}, {"id": 1767268080505, "name": "rbc", "type": "number", "label": "RBC", "options": [], "required": false}, {"id": 1767268088778, "name": "epithelial_cells", "type": "number", "label": "Epithelial Cells", "options": [], "required": false}, {"id": 1767268106578, "name": "cast_05", "type": "number", "label": "Cast (0-5)", "options": [], "required": false}, {"id": 1767268121754, "name": "crystel", "type": "select", "label": "Crystel", "options": ["Normal", "Abnormal"], "required": false}, {"id": 1767268141139, "name": "medicines_and_vaccines__whether_folic_acid_given_", "type": "select", "label": "Medicines and Vaccines - Whether folic acid given ?", "options": ["Yes", "No"], "required": false}, {"id": 1767268168531, "name": "whether_ifa_given_", "type": "select", "label": "Whether IFA given ?", "options": ["Yes", "No"], "required": false}, {"id": 1767268180005, "name": "whether_calcium_given_", "type": "select", "label": "Whether Calcium given ?", "options": ["Yes", "No"], "required": false}, {"id": 1767268202597, "name": "whether_amala_given_", "type": "select", "label": "Whether Amala given ?", "options": ["Yes", "No"], "required": false}, {"id": 1767268220054, "name": "does_mother_require_other_medicine__", "type": "select", "label": "Does mother require other medicine ? ", "options": ["Yes", "No"], "required": false}, {"id": 1767268243719, "name": "tt1", "type": "select", "label": "TT1", "options": ["Yes", "No", "Already taken in govt facility", "NA"], "required": false}, {"id": 1767268266736, "name": "tt2", "type": "select", "label": "TT2", "options": ["Yes", "No", "Already taken in govt facility", "NA"], "required": false}, {"id": 1767268332626, "name": "referral_details__does_woman_require_referral__", "type": "select", "label": "Referral Details ( Does woman require referral ? )", "options": ["Yes", "No"], "required": false}, {"id": 1767268392195, "name": "if_yes_select_the_following__place_and_reason_", "type": "select", "label": "If yes select the following - Place and Reason ", "options": ["Sub Center", "Ganiyari", "Medical College", "District hospital", "CHC", "SHW", "VHW", "OTHER"], "required": false}, {"id": 1767268493599, "name": "refferal_reason", "type": "checkbox", "label": "Refferal Reason", "options": ["Sonography", "Admission at Referral Center", "Consultation with specialist at RC", "Delivary/ LACS", "Other"], "required": false}]	t	2026-01-01 17:26:04.739561+05:30	2026-01-01 17:26:04.739561+05:30	{3,4,6,8,9}	f	0
199cea8b-bec8-4c3d-9e9d-0220af6d1a37	ANC Home Visit	antenatal	[{"id": 1767267124971, "name": "bp_systolic", "type": "number", "label": "Basic Details - Blood Pressure (systolic) (mm Hg) (90-140)", "required": true}, {"id": 1767267179372, "name": "bp_diastolic", "type": "number", "label": "Basic Details - Blood Pressure (Diastolic) (mm Hg) (50-90)", "required": true}, {"id": 1767267262119, "name": "new_complaints", "type": "checkbox", "label": "History and Physical Exam - New Complaint", "options": ["Breathing Difficulty", "Fetus is not moving", "Headache", "Blured Vision", "Pain in abdomen", "Sweeling on Face /Abdomen/ Whole Body", "Burning Micturition", "Bleeding PV", "Fever", "Vomiting", "Other", "None"], "required": true}, {"id": 1767267418636, "name": "oedema", "type": "checkbox", "label": "Oedema", "options": ["Pedal", "Vulval", "Face", "Entire Body", "No oedema"], "required": true}, {"id": 1767267740822, "name": "foetus_movement", "type": "select", "label": "Foetus Movement", "options": ["No movement", "Increased", "Decreased", "As it is", "NA"], "required": true}, {"id": 1767267777504, "name": "breast_examination", "type": "checkbox", "label": "Breast Examination", "options": ["Normal nipple", "Rectracted nipple", "Breast Lump", "Bloody nipple discharge", "Mastitis"], "required": true}, {"id": 1767267922011, "name": "urine_albumin", "type": "select", "label": "Lab Investigation - Urine Albumin", "options": ["Trace", "1+", "2+", "3+", "4+", "Nil"], "required": true}, {"id": 1767267973053, "name": "urine_sugar", "type": "select", "label": "Lab Investigation - Urine Sugar", "options": ["Trace", "1+", "2+", "3+", "4+", "Nil"], "required": true}, {"id": 1767268141139, "name": "folic_acid_given", "type": "select", "label": "Medicines - Whether folic acid given?", "options": ["Yes", "No"], "required": false}, {"id": 1767268168531, "name": "ifa_given", "type": "select", "label": "Whether IFA given?", "options": ["Yes", "No"], "required": false}, {"id": 1767268180005, "name": "calcium_given", "type": "select", "label": "Whether Calcium given?", "options": ["Yes", "No"], "required": false}, {"id": 1767268202597, "name": "amala_given", "type": "select", "label": "Whether Amala given?", "options": ["Yes", "No"], "required": false}, {"id": 1800000000001, "name": "visited_other_facility", "type": "select", "label": "JSS VISIT DETAILS - Have you visited any facility for antenatal check other than JSS?", "options": ["Yes", "No"], "required": true}, {"id": 1800000000002, "name": "other_facilities_visited", "type": "checkbox", "label": "JSS VISIT DETAILS - If YES, what are those facilities?", "options": ["Subcenter", "PHC", "CHC", "Medical College", "Private Hospital"], "required": false}, {"id": 1767268332626, "name": "require_referral", "type": "select", "label": "Referral Details (Does woman require referral?)", "options": ["Yes", "No"], "required": false}, {"id": 1767268392195, "name": "referral_place", "type": "select", "label": "If yes - Place and Reason", "options": ["Sub Center", "Ganiyari", "Medical College", "District hospital", "CHC", "SHW", "VHW", "OTHER"], "required": false}, {"id": 1767268493599, "name": "referral_reason", "type": "checkbox", "label": "Referral Reason", "options": ["Sonography", "Admission at Referral Center", "Consultation with specialist at RC", "Delivary/ LACS", "Other"], "required": false}]	t	2026-01-01 17:40:30.396408+05:30	2026-01-01 17:40:30.396408+05:30	{1,4,5,7,9}	f	0
df199de5-fb81-44af-88f4-2f00545420b4	Lab Investigation	antenatal	[{"id": 1767269849937, "name": "hiv_elisa", "type": "select", "label": "HIV (ELISA)", "options": ["Positive", "Negative", "Not Done"], "required": true}, {"id": 1767269933308, "name": "hepatitis_b", "type": "select", "label": "Hepatitis B", "options": ["Positive", "Negative", "Not Done"], "required": true}, {"id": 1767269948685, "name": "vdrl", "type": "select", "label": "VDRL", "options": ["Positive", "Negative", "Not Done"], "required": true}]	t	2026-01-01 17:49:33.771088+05:30	2026-01-01 17:49:33.771088+05:30	{2,6}	f	0
2cf7cf32-22ba-4f19-946e-4a1442f6be19	USG Report	antenatal	[{"id": 1767269973777, "name": "foetus_is_ok__", "type": "select", "label": "Foetus is ok ? ", "options": ["Yes", "No"], "required": true}, {"id": 1767270069745, "name": "presentation_of_baby_", "type": "select", "label": "Presentation of Baby ", "options": ["Vertex", "Breach", "Transverse"], "required": true}, {"id": 1767270096066, "name": "twin_baby", "type": "select", "label": "Twin Baby", "options": ["Yes", "No"], "required": true}, {"id": 1767270136163, "name": "follow_usg_required", "type": "select", "label": "Follow USG Required", "options": ["Yes", "No"], "required": true}, {"id": 1767270155755, "name": "if_yes_choose_date", "type": "date", "label": "IF YES, Choose date", "options": [], "required": false}]	t	2026-01-01 17:53:02.824367+05:30	2026-01-01 17:53:02.824367+05:30	{3,5,8}	f	0
ae5a4ffd-af19-4830-9708-89d5d8398729	Delivery 	postnatal	[{"id": 1767270367340, "name": "delivery_details__date_of_labour_pain_started", "type": "date", "label": "Delivery Details - Date of labour pain started", "options": [], "required": true}, {"id": 1767270418924, "name": "time_of_labour_pain_started", "type": "time", "label": "Time of labour pain started", "options": [], "required": true}, {"id": 1767270429044, "name": "date_of_baby_was_out", "type": "date", "label": "Date of baby was out", "options": [], "required": true}, {"id": 1767270455893, "name": "time_of_baby_was_out", "type": "time", "label": "Time of baby was out", "options": [], "required": true}, {"id": 1767270554385, "name": "gestational_age_category_term_3738_weeks", "type": "number", "label": "Gestational age category (Term 37-38 weeks)", "options": [], "required": false}, {"id": 1767270595874, "name": "place_of_delivery", "type": "select", "label": "Place of delivery", "options": ["At in law's place", "At mother's place", "JSS Subcenter", "Subcenter-Govt", "PHC", "CHC", "District Hospital", "Medical College", "Private Hospital", "JSS Ganiyari Hospital", "Other"], "required": true}, {"id": 1767270695109, "name": "type_of_delivery_", "type": "select", "label": "Type of delivery ", "options": ["Normal", "Normal with episiotomy", "C-Section", "Assisted Delivery"], "required": true}, {"id": 1767270740711, "name": "who_conducted_delivery_", "type": "select", "label": "Who conducted delivery ", "options": ["Trained TBA", "VHW", "SHW", "Untrained TBA", "Any member of house/village", "Nurse (ANW/GNW)", "Doctor", "Mitanin", "Self", "Other"], "required": true}, {"id": 1767270804728, "name": "name_of_person_who_conducted_delivery", "type": "text", "label": "Name of Person who conducted delivery", "options": [], "required": true}, {"id": 1767270820585, "name": "name_of_village_where_woman_delivered", "type": "text", "label": "Name of village where woman delivered", "options": [], "required": true}, {"id": 1767270859731, "name": "other_details__which_part_of_foetus_came_first__", "type": "select", "label": "Other Details - Which part of foetus came first ? ", "options": ["Head", "Cord", "Leg", "Hand"], "required": true}, {"id": 1767270905796, "name": "did_any_of_the_following_danger_sign_was_there_during_the_process_of_labour", "type": "checkbox", "label": "Did any of the following danger sign was there during the process of labour", "options": ["Delivered after 24 hrs after starting labour pain", "Other than head-other parts of foetus delivered first", "Placenta did not delivered within 30 minutes", "Mother is unconscious or has seizures", "None"], "required": true}, {"id": 1767271041920, "name": "what_was_the_color_of_amniotic_fluid__", "type": "select", "label": "What was the color of amniotic fluid ? ", "options": ["Waterym Yellow/Green", "Other"], "required": true}, {"id": 1767271074914, "name": "was_mother_given_tab_misprostol_3_tabsinj_oxytocin_on_thigh_within_1_min_after_the_birth__", "type": "select", "label": "Was mother given tab- Misprostol (3 tabs)/inj. Oxytocin (on thigh) within 1 min after the birth ? ", "options": ["Yes", "no", "Don't know"], "required": true}, {"id": 1767271132539, "name": "was_placenta_delivered_by_pulling", "type": "select", "label": "Was placenta delivered by pulling", "options": ["Yes", "no", "Don't know"], "required": false}, {"id": 1767271157037, "name": "was_mother_given_anything_to_drink", "type": "select", "label": "Was mother given anything to drink", "options": ["Yes", "no", "Don't know"], "required": false}, {"id": 1767271183469, "name": "did_mother_breastfed_the_baby_within_1_hour_after_the_birth", "type": "select", "label": "Did mother breastfed the baby within 1 hour after the birth", "options": ["Yes", "no", "Don't know"], "required": false}, {"id": 1767271232263, "name": "was_safe_delivery_kit_used_for_conducting_delivery", "type": "select", "label": "was safe delivery kit used for conducting delivery", "options": ["Yes", "no", "Don't know"], "required": false}, {"id": 1767271262312, "name": "did_woman_receive_vitamin_a", "type": "select", "label": "Did woman receive vitamin a", "options": ["Yes", "no", "Don't know"], "required": false}]	t	2026-01-01 18:11:49.047145+05:30	2026-01-01 18:11:49.047145+05:30	\N	f	0
33254d64-61ab-4e0f-b333-7cc315093a8c	Mother PNC	postnatal	[{"id": 1767279776119, "name": "basic_details__is_mother_suffering_from_any_of_the_following__", "type": "checkbox", "label": "Basic details : is mother suffering from any of the following ? ", "options": ["No", "Excessive bleeding", "Seizures", "Unconscious", "Other"], "required": true}, {"id": 1767279973826, "name": "if_other__specify_the_problem_mother_is_suffering_from", "type": "text", "label": "IF Other : Specify the problem mother is suffering from", "options": [], "required": false}, {"id": 1767279996089, "name": "refer_the_mother_immediately_to_hospital_did_arrangement_was_made__", "type": "checkbox", "label": "Refer the mother immediately to hospital. Did arrangement was made ? ", "options": ["Arrangement was made", "Mother went to hospital", "Mother was not ready to go to hospital"], "required": true}, {"id": 1767280071468, "name": "mother_examination__temperature_c_361378", "type": "number", "label": "Mother Examination - Temperature (°C) (36.1-37.8))", "options": [], "required": true}, {"id": 1767280164559, "name": "pulse_bpm", "type": "number", "label": "Pulse (bpm)", "options": [], "required": true}, {"id": 1767280180792, "name": "blood_pressure_systolic_mm_hg90100", "type": "number", "label": "Blood pressure (systolic) (mm Hg)(90-100)", "options": [], "required": true}, {"id": 1767280235666, "name": "blood_pressure_diastolic_mm_hg90100", "type": "number", "label": "Blood pressure (Diastolic) (mm Hg)(90-100)", "options": [], "required": true}, {"id": 1767280252473, "name": "is_there_foul_smelling_discharge_pv", "type": "select", "label": "is there foul smelling discharge pv", "options": ["Yes", "No"], "required": true}, {"id": 1767280276618, "name": "does_mother_has_seizures_", "type": "select", "label": "Does mother has seizures ?", "options": ["Yes", "No"], "required": true}, {"id": 1767280293012, "name": "does_mother_has_less_breast_milk", "type": "select", "label": "Does mother has less breast milk?", "options": ["Yes", "No"], "required": true}, {"id": 1767280310636, "name": "does_mother_has_any_breast_related_issue_like_swelling_cracked_nipple_etc_", "type": "select", "label": "Does mother has any breast related issue like swelling, cracked nipple, etc ?", "options": ["Yes", "No"], "required": true}, {"id": 1767280372822, "name": "counselling_done", "type": "select", "label": "Counselling done", "options": ["Yes", "No"], "required": false}, {"id": 1767280422759, "name": "counselling_details", "type": "checkbox", "label": "Counselling details", "options": ["Baby warming", "Child PNC Dos", "Breadfeeding (Counselling)", "Sign of good latching", "No bath till one day/week", "Vaccination", "HBNC Checkup", "PPMC Check", "Seeking care in case of any health problem", "Family Planning"], "required": false}]	t	2026-01-01 20:46:02.395516+05:30	2026-01-01 20:46:02.395516+05:30	\N	f	0
c83c2abe-5842-42d2-b7c3-a056bbfa358d	Abortion	postnatal	[{"id": 1767280612953, "name": "date_of_abortion", "type": "date", "label": "Date of abortion", "options": [], "required": true}, {"id": 1767280641583, "name": "time_of_abortion", "type": "time", "label": "Time of abortion", "options": [], "required": true}, {"id": 1767280653551, "name": "type_of_abortion", "type": "select", "label": "type of abortion", "options": ["Spontaneous", "Medical", "Surgical"], "required": true}, {"id": 1767280675343, "name": "place_of_abortion", "type": "select", "label": "Place of abortion", "options": ["Home", "Subcenter Govt", "PHC", "CHC", "District Hospital", "Medical College", "Private Hospital", "JSS Ganiyari", "Other"], "required": true}, {"id": 1767280736122, "name": "place__if_other_pls_mention", "type": "text", "label": "Place - IF OTHER PLS MENTION", "options": [], "required": false}, {"id": 1767280752634, "name": "did_woman_face_any_complication_due_to_abortion", "type": "checkbox", "label": "Did woman face any complication due to abortion?", "options": ["Sepsis", "Bleeding", "Damage to cervix", "Damage to uterus", "No Complication", "Other"], "required": true}, {"id": 1767280808019, "name": "complication__if_other_pls_mention", "type": "text", "label": "Complication - IF OTHER PLS MENTION", "options": [], "required": false}, {"id": 1767280843261, "name": "other_details_name_of_village_where_woman_got_abortion_done", "type": "text", "label": "Other DETAILS -NAME OF VILLAGE WHERE WOMAN GOT ABORTION DONE", "options": [], "required": false}]	t	2026-01-01 20:52:57.13392+05:30	2026-01-01 20:52:57.13392+05:30	\N	f	0
a1c173bf-b84a-4e84-ba03-9557eee988aa	Abortion Followup 	postnatal	[{"id": 1767280977142, "name": "how_many_times_a_day_does_mother_change_the_clothes__", "type": "number", "label": "How many times a day does mother change the clothes ? ", "options": [], "required": true}, {"id": 1767281057940, "name": "womans_examination__temperature_c_", "type": "number", "label": "Woman's Examination - Temperature (°C) ", "options": [], "required": true}, {"id": 1767281411496, "name": "pulse_bpm", "type": "number", "label": "Pulse (bpm)", "options": [], "required": true}, {"id": 1767281423456, "name": "blood_pressure_systolic_mm_hg_90140", "type": "number", "label": "Blood Pressure (systolic) (mm hg) (90-140)", "options": [], "required": true}, {"id": 1767281449394, "name": "blood_pressure_diastolic_mm_hg_90140", "type": "number", "label": "Blood Pressure (diastolic) (mm hg) (90-140)", "options": [], "required": true}, {"id": 1767281459993, "name": "is_there_foul_smelling_discharge_pv_", "type": "select", "label": "is there foul smelling discharge pv ?", "options": ["Yes", "No"], "required": true}, {"id": 1767281482906, "name": "does_mother_has_seizures_", "type": "select", "label": "Does mother has seizures ?", "options": ["Yes", "No"], "required": true}, {"id": 1767281501451, "name": "does_mother_has_any_breast_related_issue_like_swelling_cracked_nipple_etc", "type": "select", "label": "Does mother has any breast related issue like swelling, cracked nipple, etc", "options": ["Yes", "No"], "required": true}]	t	2026-01-01 21:03:00.840382+05:30	2026-01-01 21:03:00.840382+05:30	\N	f	0
c3a4ec40-1712-4e0c-a7ba-80e82ffad0e5	Referral Status	postnatal	[{"id": 1767281580851, "name": "date", "type": "date", "label": "Date", "options": [], "required": true}, {"id": 1767281646335, "name": "does_woman_require_referral_", "type": "select", "label": "Does woman require referral ?", "options": ["Yes", "NO"], "required": true}, {"id": 1767281709401, "name": "if_yes__place_of_referral", "type": "select", "label": "IF YES - Place of referral", "options": ["Subcenter", "Ganiyari", "Medical College", "District Hospital", "Private Hospital", "SHW", "VHW", "CHC"], "required": false}, {"id": 1767281782444, "name": "if_yes__referral_reason", "type": "select", "label": "IF YES - Referral reason", "options": ["Bleeding", "Seizure", "Infection", "Sonography", "Consultation with specialist at RC", "Admission at RC", "Delivery/LACS", "Other"], "required": false}]	t	2026-01-01 21:08:02.166456+05:30	2026-01-01 21:08:02.166456+05:30	\N	t	0
098078f9-a766-4dea-be28-cf7ef65c3676	Growth & Nutrition Assessment	child_care	[{"id": 3001, "name": "visit_timestamp", "type": "datetime-local", "label": "Date and Time of Visit", "required": true}, {"id": 3002, "name": "weight_kg", "type": "number", "label": "Weight (kg)", "required": true}, {"id": 3003, "name": "height_cm", "type": "number", "label": "Height/Length (cm)", "required": true}, {"id": 3004, "name": "muac_cm", "type": "number", "label": "MUAC (cm) - Arm Circumference", "required": false}, {"id": 3005, "name": "risk_indicators", "type": "checkbox", "label": "Visible Risk Indicators", "options": ["Visible Wasting", "Oedema both feet", "Severe Paleness", "Persistent Diarrhea", "None"], "required": true}]	t	2026-01-01 21:19:04.036912+05:30	2026-01-01 21:19:04.036912+05:30	{1,2,3,4,5,6,7,8,9,10,12,15,18,24,36,48,60}	t	0
83831d98-1148-4399-beb0-77a0b96c3d17	Vaccination Record	child_care	[{"id": 3101, "name": "vaccination_timestamp", "type": "datetime-local", "label": "Date and Time Administered", "required": true}, {"id": 3102, "name": "vaccine_list", "type": "checkbox", "label": "Vaccines Given Today", "options": ["BCG", "Polio (OPV/IPV)", "Pentavalent", "Rotavirus", "PCV", "Measles/MR", "DPT Booster", "Vitamin A"], "required": true}, {"id": 3103, "name": "vaccine_status", "type": "select", "label": "Dose Status", "options": ["Completed", "Partial (Stock Out)", "Refused"], "required": true}]	t	2026-01-01 21:22:11.814844+05:30	2026-01-01 21:22:11.814844+05:30	{1,2,3,9,18,60}	f	0
00173b6e-974d-47a7-9cda-9eb5bd2391f2	Results- pregnancy induced diabetes	antenatal	[{"id": 1767281960842, "name": "test_details__fbs_mgdl_80120", "type": "number", "label": "Test Details - FBS (mg/dl) (80-120)", "options": [], "required": true}, {"id": 1767282013322, "name": "pp2bs_mgdl_120150", "type": "number", "label": "pp2bs (mg/dl) (120-150)", "options": [], "required": true}, {"id": 1767282036572, "name": "hba1c_nnnddd_7", "type": "number", "label": "hba1c (nnn/ddd) (<=7)", "options": [], "required": true}]	t	2026-01-01 21:11:15.055905+05:30	2026-01-01 21:11:15.055905+05:30	{6}	f	0
d4d5c14f-7588-480b-8ed5-94fe3f40cd50	Developmental Milestones Tracking	child_care	[{"id": 4001, "name": "assessment_date", "type": "datetime-local", "label": "Date and Time of Assessment", "required": true}, {"id": 4002, "name": "physical_milestones", "type": "checkbox", "label": "Physical Development", "options": ["Holds head steady (4m)", "Sits without support (6m)", "Takes first steps (12m)", "Walks independently (18m)", "Runs and climbs (24m)"], "required": false}, {"id": 4003, "name": "social_cognitive_milestones", "type": "checkbox", "label": "Social & Cognitive Development", "options": ["Smiles at people (2m)", "Responds to own name (6m)", "Says mama/dada (9m)", "Points to show interest (12m)", "Follows 2-step instructions (24m)"], "required": false}, {"id": 4004, "name": "milestone_status", "type": "select", "label": "Overall Development Status", "options": ["On Track", "Delayed", "Needs Specialist Referral"], "required": true}, {"id": 4005, "name": "notes", "type": "text", "label": "Additional Observations", "required": false}]	t	2026-01-01 21:22:54.624379+05:30	2026-01-01 21:22:54.624379+05:30	{2,4,6,9,12,18,24}	f	0
14f9a528-6f1c-4cbe-a5c4-d5073abcc8b4	Testing meet	antenatal	[{"id": 1767516838488, "name": "patient_full_name", "type": "time", "label": "Patient Full Name", "options": [], "required": true}, {"id": 1767516977889, "name": "age", "type": "number", "label": "aGE", "options": [], "required": true}]	t	2026-01-04 14:26:27.178708+05:30	2026-01-04 14:26:27.178708+05:30	{4,5}	f	0
dd489f04-9d27-4ff5-8a46-384181174cb1	RECURRING TESTING	antenatal	[{"id": 1767516987193, "name": "patient_full_name", "type": "text", "label": "Patient Full Name", "options": [], "required": true}]	t	2026-01-04 14:28:15.797695+05:30	2026-01-04 14:28:15.797695+05:30	{1}	t	0
\.


--
-- TOC entry 5106 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
1	20251225081745_create_users_table.js	1	2025-12-25 13:52:59.787+05:30
2	20251225091012_create_token_blacklist.js	2	2025-12-25 14:42:21.658+05:30
4	20251225091520_add_reset_password_to_users.js	3	2025-12-26 12:09:23.635+05:30
5	20251226062752_create_beneficiaries_table.js	3	2025-12-26 12:09:23.68+05:30
6	20251226134709_create_forms_table.js	4	2025-12-27 02:17:38.277+05:30
7	20251226204424_add_contact_to_users.js	4	2025-12-27 02:17:38.288+05:30
8	20251228181936_add_asha_fields_to_beneficiaries.js.js	5	2025-12-28 23:50:02.35+05:30
9	20251228191818_audit_logs.js	6	2025-12-29 00:49:55.177+05:30
10	20251229120636_add_month_to_forms.js	7	2025-12-29 17:36:59.673+05:30
11	20251229190953_anc_records.js	8	2025-12-30 00:44:46.966+05:30
12	20251231122006_add_lookup_index_to_anc_records.js	9	2025-12-31 17:50:45.347+05:30
13	20260101084047_create_schedules.js.js	10	2026-01-01 14:11:25.109+05:30
14	20260101105737_month_to_array.js.js	11	2026-01-01 16:28:19.022+05:30
\.


--
-- TOC entry 5108 (class 0 OID 16398)
-- Dependencies: 222
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- TOC entry 5117 (class 0 OID 65536)
-- Dependencies: 231
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedules (id, beneficiary_id, form_id, scheduled_date, status, created_at, updated_at) FROM stdin;
5bee733d-40b7-471b-a5bd-cb69e25906d7	76	df199de5-fb81-44af-88f4-2f00545420b4	2026-01-17	planned	2026-01-03 14:13:48.974278+05:30	2026-01-03 14:14:02.155724+05:30
ec0e5023-eee1-42d6-83f2-f7c0ea1f03d1	2	2cf7cf32-22ba-4f19-946e-4a1442f6be19	2026-01-15	planned	2026-01-03 14:23:02.282452+05:30	2026-01-03 14:23:02.282452+05:30
0620f99c-2f94-461a-bd05-7786de292b86	2	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	2026-01-30	planned	2026-01-03 14:20:22.42205+05:30	2026-01-03 14:26:53.160915+05:30
aadc7bdc-5b0f-4206-848e-d97020527520	1	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	2026-01-29	planned	2026-01-03 15:32:48.811309+05:30	2026-01-04 13:14:56.060327+05:30
bf2e2ea6-9624-4485-9f57-f9efacd1159f	74	33254d64-61ab-4e0f-b333-7cc315093a8c	2026-01-10	completed	2026-01-10 17:34:20.905805+05:30	2026-01-10 17:41:42.290408+05:30
9166bc9b-6109-4d61-97da-b4979c2621e5	37	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	2026-01-10	completed	2026-01-10 17:33:57.439923+05:30	2026-01-10 18:14:09.336395+05:30
5dd4cedf-e972-439c-9147-034bae8388f6	74	199cea8b-bec8-4c3d-9e9d-0220af6d1a37	2026-01-10	planned	2026-01-10 18:28:19.30074+05:30	2026-01-10 18:28:19.30074+05:30
673542a2-67b5-4d60-93d0-1143877f6ad8	75	dd489f04-9d27-4ff5-8a46-384181174cb1	2026-01-10	planned	2026-01-10 22:22:16.179081+05:30	2026-01-10 22:22:16.179081+05:30
06eab222-581c-4648-aec8-5d20a0a1984b	128	dd489f04-9d27-4ff5-8a46-384181174cb1	2026-01-24	completed	2026-01-04 14:34:19.096285+05:30	2026-01-24 07:50:32.745797+05:30
\.


--
-- TOC entry 5110 (class 0 OID 16427)
-- Dependencies: 224
-- Data for Name: token_blacklist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.token_blacklist (token, expires_at, blacklisted_at) FROM stdin;
\.


--
-- TOC entry 5109 (class 0 OID 16405)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash, role, full_name, village, is_active, created_at, updated_at, reset_password_token, reset_password_expires, contact_number) FROM stdin;
a9ea6e9f-34fd-4313-9e4b-d2ee59fe631e	govt_admin	$2b$10$zC4vc2lc7R4bmNhvGxI75elC.yi/KFKu.i/sBYUVsnggEZPz44dQy	admin	System Administrator	\N	t	2025-12-25 14:11:41.708192+05:30	2025-12-25 14:11:41.708192+05:30	\N	\N	\N
3a19620f-fc9e-4432-a7de-462ea31b5349	anishpatil1407@gmail.com	$2b$10$VBHSHwxn.hngeh.scUoJjecZR2vv2pA.eY3C0OqQ3XjUEVbbcKR4u	asha	Vedant Patil	Rural Pune	t	2025-12-26 18:50:08.543213+05:30	2025-12-26 18:50:08.543213+05:30	\N	\N	\N
609c6ec4-8cca-4b93-beb7-14601b970848	anish.22310396@viit.ac.in	$2b$10$O99E3gq56bb6xhdVk8QFLOKIQL4oO2XJR1D5.g7OXf.SCaOgbaPtW	admin	Anish		t	2025-12-26 22:54:00.248582+05:30	2025-12-26 22:54:00.248582+05:30	\N	\N	\N
3195baac-4f5d-44a9-82fa-8345c32849c2	vedant_patil	$2b$10$wf.xq4PyRphf8bxAGEZpk.rwzi.qxzp4R95DkAFXMn2FNyFm80..e	parent	Vedant	chakna	t	2025-12-26 23:07:38.777943+05:30	2025-12-26 23:07:38.777943+05:30	\N	\N	\N
475b3022-e144-4759-b934-2c0d0b77fc2d	asha_wagh	$2b$10$9PYVVUSW4gOxYjGtsq6mAuoSP9SeeouprD0eg29Pz.04ycUOSpZni	asha	Asha Wagh	Chakan	t	2025-12-27 13:08:11.520516+05:30	2025-12-27 13:08:11.520516+05:30	\N	\N	4585858585
e650b9a8-61e8-4f27-8211-4d650cd05936	asha_work	$2b$10$XJoraHPKNGErhZLDeR70WeO.DfyNQ0SAskYpyti.2pzS4XU12evIm	asha	Testing Asha Worker	Malegaon	t	2026-01-04 12:56:58.541321+05:30	2026-01-04 12:56:58.541321+05:30	\N	\N	9876543210
72d7459e-f110-41ed-8fef-73023811b3d9	nandan_admin	$2b$10$3Se6GRrDuOFr8KF0TgK/..XsqjFW/iFrpUj8f9wjG1HaC0spfSHru	admin	Nandan	anishpatil6331@gmail.com	t	2026-01-04 13:27:42.21712+05:30	2026-01-04 13:27:42.21712+05:30	\N	\N	\N
fa8dc4df-6263-470e-8e62-23da4379dcc3	anjali_asha1	$2b$10$qenm4BJR9S6DPuKk.aHRcun1xdzliRsfcxcjth/aWoIfA5rmTOM2C	asha	Anjali Sharma	Rampur	t	2026-01-10 12:35:00.117926+05:30	2026-01-10 12:35:00.117926+05:30	\N	\N	9876543210
58a162eb-d6df-4c3b-bf7f-c1cac6ef16e1	sunita_asha2	$2b$10$UYwo7z.xg4eOlLQ3c0U1/uGL2DLOWzB6dXqbfi1LVdTeGJQj3WbKy	asha	Sunita Devi	MeeraNagar	t	2026-01-10 12:31:53.696456+05:30	2026-01-10 12:31:53.696456+05:30	\N	\N	9876543211
82b08099-15c8-4061-948d-aab4077e31a9	meena_asha3	$2b$10$DSpzXEXG0vkCT7y0K/wLIe1Svuj4zrIJo1KR8fkvwadzNOEVI17u2	asha	Meena Kumari	Gopalpur	t	2026-01-10 12:35:00.117926+05:30	2026-01-10 12:35:00.117926+05:30	\N	\N	9876543212
4898837e-8390-4849-a2c9-e9e5065a06b7	kavita_asha4	$2b$10$6i0FcIrOQxEBQ.2G4jMJBu0A5PRByjhDl.hwSpT0C3cFhmq5GO3Dy	asha	Kavita Singh	Belapur	t	2026-01-10 12:35:00.117926+05:30	2026-01-10 12:35:00.117926+05:30	\N	\N	9876543213
924dc428-da5e-4594-9043-a67c1e407003	sanket_wagh	$2b$10$boOqf02JPL0Ljn/2ZGnLM.OECFPxuP45eaNHaIYZcnshMlawpPafe	asha	Sanket	Chakan	t	2025-12-27 02:37:04.658456+05:30	2026-01-24 07:51:26.637368+05:30	\N	\N	987654322
c7d31996-fdc1-45b7-80fb-8f536260390c	anishpatil6331@gmail.com	$2b$10$hophv2AhsDIv2gYB7RdcqO4g4W8J7nVePBY2RjdBeikMd6kR/X4xO	admin	Anish Patil	Rural Pune	t	2025-12-25 15:23:38.866956+05:30	2026-01-25 17:57:45.50731+05:30	\N	\N	08010326331
\.


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 228
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 225
-- Name: beneficiaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.beneficiaries_id_seq', 166, true);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 219
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 14, true);


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 221
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- TOC entry 4947 (class 2606 OID 57374)
-- Name: anc_records anc_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anc_records
    ADD CONSTRAINT anc_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 40977)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4939 (class 2606 OID 24615)
-- Name: beneficiaries beneficiaries_govt_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beneficiaries
    ADD CONSTRAINT beneficiaries_govt_id_unique UNIQUE (govt_id);


--
-- TOC entry 4941 (class 2606 OID 24613)
-- Name: beneficiaries beneficiaries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beneficiaries
    ADD CONSTRAINT beneficiaries_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 32784)
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (id);


--
-- TOC entry 4929 (class 2606 OID 16404)
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- TOC entry 4927 (class 2606 OID 16396)
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 65556)
-- Name: schedules schedules_beneficiary_id_form_id_status_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_beneficiary_id_form_id_status_unique UNIQUE (beneficiary_id, form_id, status);


--
-- TOC entry 4952 (class 2606 OID 65549)
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 16434)
-- Name: token_blacklist token_blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_blacklist
    ADD CONSTRAINT token_blacklist_pkey PRIMARY KEY (token);


--
-- TOC entry 4931 (class 2606 OID 16423)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 16425)
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- TOC entry 4948 (class 1259 OID 57386)
-- Name: idx_anc_records_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_anc_records_lookup ON public.anc_records USING btree (beneficiary_id, form_id, month_number);


--
-- TOC entry 4932 (class 1259 OID 24596)
-- Name: users_reset_password_token_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_reset_password_token_index ON public.users USING btree (reset_password_token);


--
-- TOC entry 4935 (class 1259 OID 16426)
-- Name: users_village_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_village_index ON public.users USING btree (village);


--
-- TOC entry 4955 (class 2606 OID 57375)
-- Name: anc_records anc_records_beneficiary_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anc_records
    ADD CONSTRAINT anc_records_beneficiary_id_foreign FOREIGN KEY (beneficiary_id) REFERENCES public.beneficiaries(id) ON DELETE CASCADE;


--
-- TOC entry 4956 (class 2606 OID 57380)
-- Name: anc_records anc_records_form_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anc_records
    ADD CONSTRAINT anc_records_form_id_foreign FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE RESTRICT;


--
-- TOC entry 4954 (class 2606 OID 40978)
-- Name: audit_logs audit_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4953 (class 2606 OID 24616)
-- Name: beneficiaries beneficiaries_assigned_asha_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beneficiaries
    ADD CONSTRAINT beneficiaries_assigned_asha_id_foreign FOREIGN KEY (assigned_asha_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4957 (class 2606 OID 65550)
-- Name: schedules schedules_form_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_form_id_foreign FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;


-- Completed on 2026-02-13 05:47:41

--
-- PostgreSQL database dump complete
--

\unrestrict XC995I8lLKAWlA1RYix3q2i7j0Wxh0yyVAR36BTH7Q3PyvJSZe4LdaW6rXVmX7G

