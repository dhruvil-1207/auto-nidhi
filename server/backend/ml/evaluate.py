import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

TARGET_COLUMN = "ml_recommendation"

# ==========================================================
# LOAD TEST DATA
# ==========================================================

def load_test_data(data_dir):

    X_test = pd.read_csv(
        os.path.join(data_dir, "X_test.csv")
    )

    y_test = pd.read_csv(
        os.path.join(data_dir, "y_test.csv")
    )[TARGET_COLUMN]

    target_encoder = joblib.load(
        os.path.join(
            data_dir,
            "target_encoder.pkl"
        )
    )

    return X_test, y_test, target_encoder

# ==========================================================
# EVALUATE ONE MODEL
# ==========================================================

def evaluate_model(
    model_name,
    model,
    X_test,
    y_test,
    target_encoder,
    output_dir
):

    print(f"\nEvaluating {model_name}")

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    print(
        classification_report(
            y_test,
            predictions,
            target_names=target_encoder.classes_
        )
    )

    # --------------------------------------------------
    # Confusion Matrix
    # --------------------------------------------------

    cm = confusion_matrix(
        y_test,
        predictions
    )

    plt.figure(figsize=(8, 6))

    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=target_encoder.classes_,
        yticklabels=target_encoder.classes_
    )

    plt.title(
        f"{model_name} Confusion Matrix"
    )

    plt.xlabel("Predicted")
    plt.ylabel("Actual")

    heatmap_path = os.path.join(
        output_dir,
        f"{model_name}_confusion_matrix.png"
    )

    plt.savefig(
        heatmap_path,
        bbox_inches="tight"
    )

    plt.close()

    print(
        f"Saved: {heatmap_path}"
    )

    return {
        "Model": model_name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1 Score": f1
    }

# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    print(
        "\n========== MODEL EVALUATION STARTED ==========\n"
    )

    script_dir = os.path.dirname(
        os.path.abspath(__file__)
    )

    data_dir = os.path.join(
        script_dir,
        "data_splits"
    )

    models_dir = os.path.join(
        script_dir,
        "models"
    )

    output_dir = os.path.join(
        script_dir,
        "evaluation"
    )

    os.makedirs(
        output_dir,
        exist_ok=True
    )

    X_test, y_test, target_encoder = (
        load_test_data(data_dir)
    )

    models = {
        "xgboost":
        os.path.join(
            models_dir,
            "xgboost_model.pkl"
        ),

        "lightgbm":
        os.path.join(
            models_dir,
            "lightgbm_model.pkl"
        ),

        "randomforest":
        os.path.join(
            models_dir,
            "randomforest_model.pkl"
        ),

        "catboost":
        os.path.join(
            models_dir,
            "catboost_model.pkl"
        )
    }

    results = []

    for model_name, model_path in models.items():

        if not os.path.exists(model_path):

            print(
                f"Skipping {model_name} "
                f"(model not found)"
            )

            continue

        model = joblib.load(model_path)

        metrics = evaluate_model(
            model_name,
            model,
            X_test,
            y_test,
            target_encoder,
            output_dir
        )

        results.append(metrics)

    results_df = pd.DataFrame(results)

    results_df.sort_values(
        by="Accuracy",
        ascending=False,
        inplace=True
    )

    comparison_path = os.path.join(
        output_dir,
        "model_comparison.csv"
    )

    results_df.to_csv(
        comparison_path,
        index=False
    )

    print("\n==============================")
    print("MODEL COMPARISON")
    print("==============================")

    print(results_df)

    print(
        f"\nSaved comparison file:\n"
        f"{comparison_path}"
    )

    print(
        "\n========== MODEL EVALUATION COMPLETED ==========\n"
    )