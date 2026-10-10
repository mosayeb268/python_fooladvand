def Student(stno, year, *grades, term=1, gender, **courses):
    print(f"{stno=}")
    print(f"{year=}")
    print(f"{grades=}")
    print(f"{term=}")
    print(f"{gender=}")
    print(f"{courses=}")


# --------------------
Student(140233, 1403, 12, 18, 17, term=2, gender="male", DB=3, DS=4, Web=2)
