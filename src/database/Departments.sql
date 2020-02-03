COPY departments (id, name, type) FROM stdin;
1	University of Oxford employee or student	university
2	Begbroke company employee	begbroke
3	visitor	visitor
\.

SELECT pg_catalog.setval('departments_id_seq', 3, true);