import json

import pandas as pd
import recordlinkage
from recordlinkage import ECMClassifier
from recordlinkage.index import Full
from recordlinkage.network import ConnectedComponents

# Load and prepare data
df = pd.read_csv('data/data.csv')
df.set_index('id', inplace=True)

# Convert dates to datetime format for proper comparison
df['dob'] = pd.to_datetime(df['dob'], errors='coerce')

# Generate all possible record pairs
indexer = Full()
candidate_links = indexer.index(df)

# Define field comparisons
compare = recordlinkage.Compare()
compare.date('dob', 'dob', label='dob', missing_value=0.0)
compare.string('first_name', 'first_name', method='jarowinkler', 
               threshold=0.8, missing_value=0.0, label='first_name')
compare.string('surname', 'surname', method='jarowinkler', 
               threshold=0.8, missing_value=0.0, label='surname')
compare.string('email', 'email', method='jarowinkler', 
               threshold=0.9, missing_value=0.0, label='email')
compare.string('city', 'city', method='jarowinkler', 
               threshold=0.8, missing_value=0.0, label='city')

# Compute similarity features for all pairs
features = compare.compute(candidate_links, df)

# Binarize features: convert similarity scores to 0/1 using sensible thresholds
binarized_features = features.copy()
binarized_features['dob'] = (features['dob'] > 0.8).astype(int)
binarized_features['first_name'] = (features['first_name'] > 0.85).astype(int)
binarized_features['surname'] = (features['surname'] > 0.85).astype(int)
binarized_features['email'] = (features['email'] > 0.9).astype(int)
binarized_features['city'] = (features['city'] > 0.8).astype(int)

# Fit ECMClassifier (unsupervised)
clf = ECMClassifier()
clf.fit(binarized_features)

# Get match probabilities for all pairs
probs = clf.prob(binarized_features)

# Set probability threshold for considering a match
prob_threshold = 0.85  # Might need to be tuned

# Filter to pairs exceeding the threshold
potential_matches = pd.DataFrame(index=probs[probs >= prob_threshold].index)
potential_matches['probability'] = probs[probs >= prob_threshold]

# Build clusters from matching pairs
cc = ConnectedComponents()
clusters = cc.compute(potential_matches.index)

# Build clusters as lists of record IDs, omitting singletons
clusters_json = []
for multiindex in clusters:
    record_pairs = multiindex.tolist()
    members = set()
    for pair in record_pairs:
        members.update(pair)
    members = sorted(members)
    if len(members) > 1:
        clusters_json.append(members)

# Save to JSON
with open('data/ground_truth_clusters.json', 'w') as f:
    json.dump(clusters_json, f)
print('Ground truth clusters saved to data/ground_truth_clusters.json (list of clusters, no singletons)')

# Output statistics
print(f"Loaded {len(df)} records from data.csv")
print(f"Generated {len(candidate_links)} candidate pairs (all-vs-all)")
print(f"Number of potential matches (pairs with probability >= {prob_threshold}): {len(potential_matches)}")
print(f"Number of clusters found: {len(clusters_json)} (excluding singletons)")

# Show a few sample clusters
print("\nSample clusters:")
for i, cluster in enumerate(clusters_json[:3]):
    print(f"  Cluster {i}: size={len(cluster)}, record_ids={cluster}") 