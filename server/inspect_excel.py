import pandas as pd
import sys

try:
    file_path = '/Users/nta19/Library/Mobile Documents/com~apple~CloudDocs/PROJECTS /אפליקציה לאבא/apartments_db.xlsx'
    df = pd.read_excel(file_path)
    print("Columns:", list(df.columns))
    print("First row:", df.iloc[0].to_dict())
except Exception as e:
    print(e)
