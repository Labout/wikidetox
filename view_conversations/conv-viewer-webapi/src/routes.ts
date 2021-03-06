/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as bigquery from '@google-cloud/bigquery';
import * as express from 'express';

import * as config from './config';
import * as httpcodes from './http-status-codes';
import * as runtime_types from './runtime_types';

// Convert the special 'BigQueryTimestamp' types to their string representation.
function convertToSimpleTypes(rows: bigquery.QueryResult) {
  for (let r of rows) {
    for (let key in r) {
      let obj = r[key];
      if (obj === null || typeof (obj) === 'string' ||
          typeof (obj) === 'number') {
        continue;
      }
      if (obj && obj.constructor.name === 'BigQueryTimestamp' &&
          'value' in obj) {
        r[key] = obj.value;
      }
    }
  }
}

//
const SEARCH_BY_TYPE = new runtime_types.RuntimeStringType<string>(
    'SearchBy', /^(conversation_id|rev_id|page_id|page_title|id)$/);

const SEARCH_OP_TYPE =
    new runtime_types.RuntimeStringType<string>('SearchBy', /^(=|LIKE)$/);

// TODO(ldixon): in time we can maybe make this a bit smarter and support
// escaped quotes.
const BQ_SQL_SAFE_STRING =
    new runtime_types.RuntimeStringType<string>('SearchBy', /^[^"]+$/);

// TODO(ldixon): consider using passport auth
// for google cloud project.
export function setup(
    app: express.Express, conf: config.Config,
    bqClient: bigquery.BigQueryClient) {
  let table = `\`${conf.bigQueryProjectId}.${conf.bigQueryDataSetId}.${
      conf.bigQueryTable}\``;

  app.get('/api/conversation-id/:conv_id', async (req, res) => {
    try {
      let conv_id: runtime_types.ConversationId =
          runtime_types.ConversationId.assert(req.params.conv_id);

      // TODO remove outer try wrapper unless it get used.
      const sqlQuery = `SELECT *
      FROM ${table}
      WHERE conversation_id="${conv_id}"
      LIMIT 100`;
      // Query options list:
      // https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
      const options = {
        query: sqlQuery,
        useLegacySql: false,  // Use standard SQL syntax for queries.
      };

      await bqClient.query(options).then(results => {
        const rows = results[0];
        convertToSimpleTypes(rows);
        res.status(httpcodes.OK).send(JSON.stringify(rows, null, 2));
      });
    } catch (e) {
      console.error(`*** Failed: `, e);
      res.status(httpcodes.INTERNAL_SERVER_ERROR).send(JSON.stringify({
        error: e.message
      }));
    }
  });

  app.get('/api/comment-id/:comment_id', async (req, res) => {
    try {
      let comment_id: runtime_types.CommentId =
          runtime_types.CommentId.assert(req.params.comment_id);

      // TODO remove outer try wrapper unless it get used.
      const sqlQuery = `SELECT *
      FROM ${table}
      WHERE id="${comment_id}"
      LIMIT 100`;
      // Query options list:
      // https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
      const options = {
        query: sqlQuery,
        useLegacySql: false,  // Use standard SQL syntax for queries.
      };

      await bqClient.query(options).then(results => {
        const rows = results[0];
        convertToSimpleTypes(rows);
        res.status(httpcodes.OK).send(JSON.stringify(rows, null, 2));
      });
    } catch (e) {
      console.error(`*** Failed: `, e);
      res.status(httpcodes.INTERNAL_SERVER_ERROR).send(JSON.stringify({
        error: e.message
      }));
    }
  });

  app.get('/api/revision-id/:rev_id', async (req, res) => {
    try {
      let rev_id: runtime_types.RevisionId =
          runtime_types.RevisionId.assert(req.params.rev_id);

      // TODO remove outer try wrapper unless it get used.
      const sqlQuery = `SELECT *
      FROM ${table}
      WHERE rev_id=${rev_id}
      LIMIT 100`;
      // Query options list:
      // https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
      const options = {
        query: sqlQuery,
        useLegacySql: false,  // Use standard SQL syntax for queries.
      };

      await bqClient.query(options).then(results => {
        const rows = results[0];
        convertToSimpleTypes(rows);
        res.status(httpcodes.OK).send(JSON.stringify(rows, null, 2));
      });
    } catch (e) {
      console.error(`*** Failed: `, e);
      res.status(httpcodes.INTERNAL_SERVER_ERROR).send(JSON.stringify({
        error: e.message
      }));
    }
  });

  app.get('/api/page-id/:page_id', async (req, res) => {
    try {
      let page_id: runtime_types.PageId =
          runtime_types.PageId.assert(req.params.page_id);

      // TODO remove outer try wrapper unless it get used.
      const sqlQuery = `SELECT *
      FROM ${table}
      WHERE page_id=${page_id}
      LIMIT 100`;
      // Query options list:
      // https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
      const options = {
        query: sqlQuery,
        useLegacySql: false,  // Use standard SQL syntax for queries.
      };

      await bqClient.query(options).then(results => {
        const rows = results[0];
        convertToSimpleTypes(rows);
        res.status(httpcodes.OK).send(JSON.stringify(rows, null, 2));
      });
    } catch (e) {
      console.error(`*** Failed: `, e);
      res.status(httpcodes.INTERNAL_SERVER_ERROR).send(JSON.stringify({
        error: e.message
      }));
    }
  });

  app.get('/api/page-title/:page_title', async (req, res) => {
    try {
      let page_title: runtime_types.PageTitleSearch =
          runtime_types.PageTitleSearch.assert(req.params.page_title);

      // TODO remove outer try wrapper unless it get used.
      const sqlQuery = `SELECT *
      FROM ${table}
      WHERE page_title LIKE "${page_title}"
      LIMIT 100`;
      // Query options list:
      // https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
      const options = {
        query: sqlQuery,
        useLegacySql: false,  // Use standard SQL syntax for queries.
      };
      console.log(sqlQuery);

      await bqClient.query(options).then(results => {
        const rows = results[0];
        convertToSimpleTypes(rows);
        res.status(httpcodes.OK).send(JSON.stringify(rows, null, 2));
      });
    } catch (e) {
      console.error(`*** Failed: `, e);
      res.status(httpcodes.INTERNAL_SERVER_ERROR).send(JSON.stringify({
        error: e.message
      }));
    }
  });

  app.get('/api/search/:search_by/:search_op/:search_for', async (req, res) => {
    if (!SEARCH_BY_TYPE.isValid(req.params.search_by)) {
      let errorMsg = `Error: Invalid searchBy string: ${req.params.search_by}`
      console.error(errorMsg);
      res.status(httpcodes.BAD_REQUEST).send(JSON.stringify({error: errorMsg}));
      return;
    }
    if (!SEARCH_OP_TYPE.isValid(req.params.search_op)) {
      let errorMsg = `Error: Invalid searchOp string: ${req.params.search_op}`
      console.error(errorMsg);
      res.status(httpcodes.BAD_REQUEST).send(JSON.stringify({error: errorMsg}));
      return;
    }
    if (!BQ_SQL_SAFE_STRING.isValid(req.params.search_for)) {
      let errorMsg = `Error: Invalid searchFor string: ${req.params.search_for}`
      console.error(errorMsg);
      res.status(httpcodes.BAD_REQUEST).send(JSON.stringify({error: errorMsg}));
      return;
    }
    try {
      // TODO remove outer try wrapper unless it get used.
      const sqlQuery = `SELECT *
      FROM ${table}
      WHERE ${req.params.search_by} ${req.params.search_op} "${
          req.params.search_for}"
      LIMIT 100`;
      // Query options list:
      // https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
      const options = {
        query: sqlQuery,
        useLegacySql: false,  // Use standard SQL syntax for queries.
      };
      await bqClient.query(options).then(results => {
        const rows = results[0];
        convertToSimpleTypes(rows);
        res.status(httpcodes.OK).send(JSON.stringify(rows, null, 2));
      });
    } catch (e) {
      console.error(`*** Failed: `, e);
      res.status(httpcodes.INTERNAL_SERVER_ERROR).send(JSON.stringify({
        error: e.message
      }));
    }
  });
}
