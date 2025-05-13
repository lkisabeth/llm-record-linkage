from typing import List

import numpy as np
import pandas as pd
import recordlinkage
from sklearn.metrics import mutual_info_score, v_measure_score

def get_pairwise_links(clusters: List[List[int]]):
    import itertools
    links = set()
    for ids in clusters:
        if len(ids) > 1:
            links.update(itertools.combinations(sorted(ids), 2))
    return pd.MultiIndex.from_tuples(list(links))

def clusters_to_labels(clusters, all_ids):
    """Assigns a unique label to each cluster for each record ID in all_ids."""
    id_to_label = {rid: -1 for rid in all_ids}
    for label, cluster in enumerate(clusters):
        for rid in cluster:
            id_to_label[rid] = label
    return np.array([id_to_label[rid] for rid in all_ids])

def closest_cluster_f1(gt_clusters, pred_clusters):
    # Jaccard-based Closest Cluster F1 as in the referenced paper
    def jaccard(a, b):
        return len(set(a) & set(b)) / len(set(a) | set(b)) if (set(a) | set(b)) else 0.0
    # Precision: for each pred, max Jaccard with any gt
    prec = np.mean([max([jaccard(pred, gt) for gt in gt_clusters] or [0]) for pred in pred_clusters])
    # Recall: for each gt, max Jaccard with any pred
    rec = np.mean([max([jaccard(gt, pred) for pred in pred_clusters] or [0]) for gt in gt_clusters])
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0.0
    return {"precision": prec, "recall": rec, "f1": f1}

def evaluate_clusters(gt_clusters, pred_clusters, all_ids=None, df=None):
    """
    Evaluate clustering results against ground truth.
    Returns a dict with pairwise, v_measure, vi, and closest_cluster_f1 metrics.
    """
    if all_ids is None:
        all_ids = sorted({rid for cluster in gt_clusters + pred_clusters for rid in cluster})
    gt_labels = clusters_to_labels(gt_clusters, all_ids)
    pred_labels = clusters_to_labels(pred_clusters, all_ids)

    # --- Pairwise metrics using recordlinkage ---
    links_true = get_pairwise_links(gt_clusters)
    links_pred = get_pairwise_links(pred_clusters)

    pairwise_precision = recordlinkage.precision(links_true, links_pred)
    pairwise_recall = recordlinkage.recall(links_true, links_pred)
    pairwise_f1 = recordlinkage.fscore(links_true, links_pred)

    # --- Clustering metrics using sklearn ---
    v_measure = v_measure_score(gt_labels, pred_labels)
    vi = mutual_info_score(gt_labels, pred_labels)

    # --- Closest Cluster F1 ---
    closest_f1 = closest_cluster_f1(gt_clusters, pred_clusters)

    return {
        "pairwise": {"precision": pairwise_precision, "recall": pairwise_recall, "f1": pairwise_f1},
        "v_measure": v_measure,
        "vi": vi,
        "closest_cluster_f1": closest_f1
    } 