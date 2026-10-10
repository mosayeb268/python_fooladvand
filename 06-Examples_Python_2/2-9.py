def Func2(a, b):
    s1 = a + b
    s2 = a * b
    return s1, s2


# ------------------
x = 5
y = 7
r1, r2 = Func2(x, y)
print(f"{r1=}")
print(f"{r2=}")
