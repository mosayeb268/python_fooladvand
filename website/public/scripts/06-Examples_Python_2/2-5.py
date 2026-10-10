sum_odds = 0
while True:
    num = int(input("Yek adad vared konid:"))
    if num % 2 == 0:
        print("Yek add *Fard* vared konid!")
        continue
    sum_odds += num
    ans = input("Edame Midahid?(y/n):")
    if ans == "Y" or ans == "y":
        continue
    break
print(f"Hasel Adad Fard hast={sum_odds}")
