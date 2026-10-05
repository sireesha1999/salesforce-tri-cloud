/**
 * Scenario A6 — a custom REST API (remote call-in).
 *   GET  /services/apexrest/v1/cases/{caseId}   -> case summary
 *   POST /services/apexrest/v1/cases            -> create case, 201 or 400
 * Uses a DTO so the external contract is stable even if fields change,
 * and USER_MODE so the calling integration user's permissions apply.
 */
@RestResource(urlMapping='/v1/cases/*')
global with sharing class CaseApi {
    global class CaseDto {
        public String id;
        public String caseNumber;
        public String subject;
        public String status;
        public String priority;
        public String accountId;
    }

    global class CreateRequest {
        public String accountId;
        public String subject;
        public String priority;
    }

    @HttpGet
    global static void getCase() {
        RestResponse res = RestContext.response;
        String rawId = RestContext.request.requestURI.substringAfterLast('/');
        Id caseId;
        try {
            caseId = Id.valueOf(rawId);
        } catch (Exception e) {
            respond(res, 400, new Map<String, String>{ 'error' => 'Invalid case id' });
            return;
        }
        List<Case> found = [
            SELECT Id, CaseNumber, Subject, Status, Priority, AccountId
            FROM Case
            WHERE Id = :caseId
            WITH USER_MODE
            LIMIT 1
        ];
        if (found.isEmpty()) {
            respond(res, 404, new Map<String, String>{ 'error' => 'Case not found' });
            return;
        }
        respond(res, 200, toDto(found[0]));
    }

    @HttpPost
    global static void createCase() {
        RestResponse res = RestContext.response;
        CreateRequest body;
        try {
            body = (CreateRequest) JSON.deserialize(RestContext.request.requestBody.toString(), CreateRequest.class);
        } catch (Exception e) {
            respond(res, 400, new Map<String, String>{ 'error' => 'Invalid JSON' });
            return;
        }
        if (body == null || String.isBlank(body.subject)) {
            respond(res, 400, new Map<String, String>{ 'error' => 'subject is required' });
            return;
        }
        Case c = new Case(
            Subject = body.subject.left(255),
            Priority = String.isBlank(body.priority) ? 'Medium' : body.priority,
            AccountId = String.isBlank(body.accountId) ? null : body.accountId,
            Origin = 'Web'
        );
        try {
            Database.insert(c, AccessLevel.USER_MODE);
        } catch (Exception e) {
            respond(res, 400, new Map<String, String>{ 'error' => e.getMessage() });
            return;
        }
        Case created = [SELECT Id, CaseNumber, Subject, Status, Priority, AccountId FROM Case WHERE Id = :c.Id];
        respond(res, 201, toDto(created));
    }

    private static CaseDto toDto(Case c) {
        CaseDto dto = new CaseDto();
        dto.id = c.Id;
        dto.caseNumber = c.CaseNumber;
        dto.subject = c.Subject;
        dto.status = c.Status;
        dto.priority = c.Priority;
        dto.accountId = c.AccountId;
        return dto;
    }

    private static void respond(RestResponse res, Integer status, Object payload) {
        res.statusCode = status;
        res.addHeader('Content-Type', 'application/json');
        res.responseBody = Blob.valueOf(JSON.serialize(payload));
    }
}
