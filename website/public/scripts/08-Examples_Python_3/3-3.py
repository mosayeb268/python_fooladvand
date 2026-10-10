def findMin(*t):
    my_min = t[0]
    for item in t[1:]:
        if item < my_min:
            my_min = item
    return my_min


# -------------------
print(f"Min={findMin(34,56,-1,98,0,-5,456,55)}")
print(f"Min={findMin(58,9,240)}")
