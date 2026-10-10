def findMax(a, b, c):
    my_max = a if a > b else b
    my_max = c if c > my_max else my_max
    return my_max


# ----------------------
x = int(input("Adad aval ra vared konid:"))
y = int(input("Adad dovom ra vared konid:"))
z = int(input("Adad sevom ra vared konid:"))
print(f"Bozorgtarin={findMax(x,y,z)}")
