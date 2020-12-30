from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
# from sklearn.externals import joblib
import joblib
import os
from azureml.core.run import Run
run = Run.get_context()


os.makedirs('./outputs', exist_ok=True)
X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5, random_state=0)
for i in range(10000000):
    gnb = GaussianNB()
    model = gnb.fit(X_train, y_train)
y_pred = model.predict(X_test)

# metrics
from sklearn.metrics import roc_auc_score
score = model.predict_proba(X_test)
auc = roc_auc_score(y_test, score, multi_class='ovo')


from sklearn.metrics import accuracy_score
acc = accuracy_score(y_test, y_pred)

run.log('acc', acc)
run.log('auc', auc)
run.log_list('cpu%',[10, 15, 12, 13, 14, 15])
run.log_list('mem%',[10, 15, 12, 13, 14, 15])
run.log_table("metrics over time", {"time":[1, 2, 3, 4, 5, 6], "cpu%":[10, 15, 12, 13, 14, 15], "mem%":[10, 15, 12, 13, 14, 15]})

# model
model_file_name = 'sklearn-nb-local'
with open(model_file_name, "wb") as file:
    joblib.dump(value=model, filename=os.path.join('./outputs/',
                                                   model_file_name))