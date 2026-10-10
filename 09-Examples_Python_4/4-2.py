# name_score = {"ali": 15, "reza": 13, "hamid": 17, "ahmad": 14}
# result1 = max(name_score)
# print(f"{result1=}")

# result2 = max(name_score.keys(), key=(lambda x: name_score[x]))
# print(f"{result2=}")
# --------------------------
# scores = [12, 5, 16, 19, 11, 8, 20, 13]
# result3 = filter(lambda x: x < 10, scores)
# print(f"{list(result3)}")
# ---------------------------
# names = ["ali", "hasan", "hamid", "Zahra", "abas"]
# result4 = map(lambda x: len(x), names)
# print(f"{list(result4)}")
# -----------------------------
text = ["bcd", "ab", "eeee", "ddddd", "cdcd", "kooo", "cmh"]
text.sort()
print(f"{text=}")
text.sort(key=lambda x: len(set(x)))
print(f"{text=}")
