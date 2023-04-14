<!-- Delete all non-group data -->

<!-- mutation {
  delete_description(where:{topic_slug:{_neq:""}}) {
    affected_rows
  }
  delete_relationship(where:{to_slug:{_neq:""}}) {
    affected_rows
  }
  delete_hierarchy(where:{child_slug:{_neq:""}}) {
    affected_rows
  }
  delete_topic(where:{groups_aggregate: {count: {predicate: {_eq: 0}}}}){
    affected_rows
  }
} -->
