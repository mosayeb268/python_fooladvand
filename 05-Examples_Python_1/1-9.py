x=int(input("Enter x: "))
n=int(input("Enter n: "))
sign=1
s=0
for i in range(1,n+1,2):
    s+=sign*(x**i)
    sign=-sign
print(f"hasel ebarat ba {x=} va {n=} barabar ast ba={s}")

