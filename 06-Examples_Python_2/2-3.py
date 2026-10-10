# 462 => 12
num = int(input("Adad ra vared konid:"))
hlp = num
s = 0
while hlp != 0:
    s += hlp % 10
    hlp //= 10
print(f"Hasel Argham Adad {num} hast={s}")
