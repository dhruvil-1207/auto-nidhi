import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# ==========================================================
# CONFIG
# ==========================================================

TARGET_COLUMN = "ml_recommendation"
RANDOM_STATE = 42

# ==========================================================
# LOAD DATA
# ==========================================================

def load_and_prepare_data(data_dir):

    print("Loading train/test datasets...")

    X_train_path = os.path.join(data_dir, "X_train.csv")
    X_test_path = os.path.join(data_dir, "X_test.csv")
    y_train_path = os.path.join(data_dir, "y_train.csv")
    y_test_path = os.path.join(data_dir, "y_test.csv")
    target_encoder_path = os.path.join(
        data_dir,
        "target_encoder.pkl"
    )

    X_train = pd.read_csv(X_train_path)
    X_test = pd.read_csv(X_test_path)

    y_train = pd.read_csv(
        y_train_path
    )[TARGET_COLUMN]

    y_test = pd.read_csv(
        y_test_path
    )[TARGET_COLUMN]

    target_encoder = joblib.load(
        target_encoder_path
    )

    print(f"Train Shape: {X_train.shape}")
    print(f"Test Shape : {X_test.shape}")

    return (
        X_train,
        X_test,
        y_train,
        y_test,
        target_encoder
    )

# ==========================================================
# TRAIN RANDOM FOREST
# ==========================================================

def train_and_evaluate_model(
    X_train,
    X_test,
    y_train,
    y_test,
    target_encoder,
    model_dir
):

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        class_weight="balanced",
        min_samples_split=5,
        min_samples_leaf=2
    )

    print("\nTraining Random Forest...")

    model.fit(
        X_train,
        y_train
    )

    # --------------------------------------------------
    # EVALUATION
    # --------------------------------------------------

    predictions = model.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print(
        f"\nAccuracy: {accuracy:.4f}"
    )

    print(
        "\nClassification Report:\n"
    )

    print(
        classification_report(
            y_test,
            predictions,
            target_names=target_encoder.classes_
        )
    )

    print(
        "\nConfusion Matrix:\n"
    )

    print(
        confusion_matrix(
            y_test,
            predictions
        )
    )

    # --------------------------------------------------
    # FEATURE IMPORTANCE
    # --------------------------------------------------

    feature_importance = pd.Series(
        model.feature_importances_,
        index=X_train.columns
    ).sort_values(
        ascending=False
    )

    print(
        "\nTop 10 Important Features:\n"
    )

    print(
        feature_importance.head(10)
    )

    # --------------------------------------------------
    # SAVE MODEL
    # --------------------------------------------------

    os.makedirs(
        model_dir,
        exist_ok=True
    )

    model_path = os.path.join(
        model_dir,
        "randomforest_model.pkl"
    )

    joblib.dump(
        model,
        model_path
    )

    print(
        f"\nModel saved to:\n{model_path}"
    )

# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    print(
        "\n========== RANDOM FOREST TRAINING STARTED ==========\n"
    )

    try:

        script_dir = os.path.dirname(
            os.path.abspath(__file__)
        )

        data_dir = os.path.join(
            script_dir,
            "data_splits"
        )

        model_dir = os.path.join(
            script_dir,
            "models"
        )

        (
            X_train,
            X_test,
            y_train,
            y_test,
            target_encoder
        ) = load_and_prepare_data(
            data_dir
        )

        train_and_evaluate_model(
            X_train,
            X_test,
            y_train,
            y_test,
            target_encoder,
            model_dir
        )

        print(
            "\n========== RANDOM FOREST TRAINING COMPLETED ==========\n"
        )

    except Exception as e:

        print(
            f"\nERROR: {str(e)}"
        )

        raise