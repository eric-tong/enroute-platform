COPY bus_stops (id, name, street, icon, longitude, latitude, direction, display_position, road_angle, url, is_terminal) FROM stdin;
1	Begbroke Science Park	Begbroke Lane	B	-1.30649400000000004	51.8179799999999986	Town Centre	1	\N	begbroke-science-park	t
2	Parkway Park & Ride	Oxford Road	P	-1.27447400000000011	51.8022810000000007	Town Centre	2	155	parkway-park-and-ride-southbound	f
3	Summertown Shops	Banbury Road	S	-1.2649189999999999	51.7777510000000021	Town Centre	3	165	summertown-shops	f
4	Department of Materials	Parks Road	M	-1.2585869999999999	51.7604240000000004	Town Centre	4	1	department-of-materials-southbound	f
5	BBC Oxford	Banbury Road	B	-1.26571600000000006	51.7793559999999999	Begbroke	3	345	bbc-oxford	f
6	Oxford Town Centre	Broad Street	T	-1.25565900000000008	51.754564000000002	Begbroke	1	80	oxford-town-centre	f
7	Department of Materials	Parks Road	M	-1.25915899999999992	51.7606820000000027	Begbroke	2	320	department-of-materials-northbound	f
8	Parkway Park & Ride	Oxford Road	P	-1.27494599999999991	51.8027069999999981	Begbroke	4	335	parkway-park-and-ride-northbound	f
\.

SELECT pg_catalog.setval('bus_stops_id_seq', 8, true);