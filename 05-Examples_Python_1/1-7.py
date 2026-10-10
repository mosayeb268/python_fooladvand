text=input("Matan ra vared konid: ")
count=0
for ch in text:
    if ch>="0" and ch<="9":
        count+=1
    print(f"{ch}",end=" ")
print(f"\nTedad Argham Matn hast={count}")
