a=int(input("Adad aval ra vared konid: "))
b=int(input("Adad Dovom ra vared konid: "))
op=input("Amalgar ra vared konid: ")
if op=="+":
    print(f"{a+b=}")
elif op=="-":
    print(f"{a-b=}")
elif op=="*":
    print(f"{a*b=}")
elif op=="**":
    print(f"{a**b=}")
elif op=="/":
    print(f"{a/b=:6.2f}")
elif op=="//":
    print(f"{a//b=}")
else:
    print(f"yek amlgar Mojaz vared konid.")
