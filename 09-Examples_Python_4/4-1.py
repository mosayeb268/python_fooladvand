# تابع بی نام
# def S(a, b):
#     return a**2 + b**2

# -------------------
x = int(input("Enter x:"))
y = int(input("Enter y:"))

# روش معمول تعریف تابع
# res1 = S(x, y)
# print(f"{res1=}")

# روش اول
res2 = (lambda a, b: a**2 + b**2)(x, y)
print(f"{res2=}")

# روش دوم
func = lambda a, b: a**2 + b**2
res3 = func(x, y)
print(f"{res3=}")
