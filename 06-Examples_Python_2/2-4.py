sum_evens = 0
sum_odds = 0
while True:
    num = int(input("Adad ra vared konid:"))
    if num == 0:
        break
    elif num % 2 == 0:
        sum_evens += num
    else:
        sum_odds += num
print(f"Hasel Adade Fard={sum_odds}, Hasel Adade Zoj={sum_evens}")
