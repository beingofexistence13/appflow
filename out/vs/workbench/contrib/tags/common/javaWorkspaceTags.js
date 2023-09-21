/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JavaLibrariesToLookFor = exports.MavenArtifactIdRegex = exports.MavenGroupIdRegex = exports.MavenDependencyRegex = exports.MavenDependenciesRegex = exports.GradleDependencyCompactRegex = exports.GradleDependencyLooseRegex = void 0;
    exports.GradleDependencyLooseRegex = /group\s*:\s*[\'\"](.*?)[\'\"]\s*,\s*name\s*:\s*[\'\"](.*?)[\'\"]\s*,\s*version\s*:\s*[\'\"](.*?)[\'\"]/g;
    exports.GradleDependencyCompactRegex = /[\'\"]([^\'\"\s]*?)\:([^\'\"\s]*?)\:([^\'\"\s]*?)[\'\"]/g;
    exports.MavenDependenciesRegex = /<dependencies>([\s\S]*?)<\/dependencies>/g;
    exports.MavenDependencyRegex = /<dependency>([\s\S]*?)<\/dependency>/g;
    exports.MavenGroupIdRegex = /<groupId>([\s\S]*?)<\/groupId>/;
    exports.MavenArtifactIdRegex = /<artifactId>([\s\S]*?)<\/artifactId>/;
    exports.JavaLibrariesToLookFor = [
        // azure
        { 'groupId': 'com.microsoft.azure', 'artifactId': 'azure', 'tag': 'azure' },
        { 'groupId': 'com.microsoft.azure', 'artifactId': 'azure-mgmt-.*', 'tag': 'azure' },
        { 'groupId': 'com\\.microsoft\\.azure\\..*', 'artifactId': 'azure-mgmt-.*', 'tag': 'azure' },
        // java ee
        { 'groupId': 'javax', 'artifactId': 'javaee-api', 'tag': 'javaee' },
        { 'groupId': 'javax.xml.bind', 'artifactId': 'jaxb-api', 'tag': 'javaee' },
        // jdbc
        { 'groupId': 'mysql', 'artifactId': 'mysql-connector-java', 'tag': 'jdbc' },
        { 'groupId': 'com.microsoft.sqlserver', 'artifactId': 'mssql-jdbc', 'tag': 'jdbc' },
        { 'groupId': 'com.oracle.database.jdbc', 'artifactId': 'ojdbc10', 'tag': 'jdbc' },
        // jpa
        { 'groupId': 'org.hibernate', 'artifactId': 'hibernate-core', 'tag': 'jpa' },
        { 'groupId': 'org.eclipse.persistence', 'artifactId': 'eclipselink', 'tag': 'jpa' },
        // lombok
        { 'groupId': 'org.projectlombok', 'artifactId': 'lombok', 'tag': 'lombok' },
        // mockito
        { 'groupId': 'org.mockito', 'artifactId': 'mockito-core', 'tag': 'mockito' },
        { 'groupId': 'org.powermock', 'artifactId': 'powermock-core', 'tag': 'mockito' },
        // redis
        { 'groupId': 'org.springframework.data', 'artifactId': 'spring-data-redis', 'tag': 'redis' },
        { 'groupId': 'redis.clients', 'artifactId': 'jedis', 'tag': 'redis' },
        { 'groupId': 'org.redisson', 'artifactId': 'redisson', 'tag': 'redis' },
        { 'groupId': 'io.lettuce', 'artifactId': 'lettuce-core', 'tag': 'redis' },
        // spring boot
        { 'groupId': 'org.springframework.boot', 'artifactId': '.*', 'tag': 'springboot' },
        // sql
        { 'groupId': 'org.jooq', 'artifactId': 'jooq', 'tag': 'sql' },
        { 'groupId': 'org.mybatis', 'artifactId': 'mybatis', 'tag': 'sql' },
        // unit test
        { 'groupId': 'org.junit.jupiter', 'artifactId': 'junit-jupiter-api', 'tag': 'unitTest' },
        { 'groupId': 'junit', 'artifactId': 'junit', 'tag': 'unitTest' },
        { 'groupId': 'org.testng', 'artifactId': 'testng', 'tag': 'unitTest' }
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YVdvcmtzcGFjZVRhZ3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YWdzL2NvbW1vbi9qYXZhV29ya3NwYWNlVGFncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFbkYsUUFBQSwwQkFBMEIsR0FBRyx5R0FBeUcsQ0FBQztJQUN2SSxRQUFBLDRCQUE0QixHQUFHLDBEQUEwRCxDQUFDO0lBRTFGLFFBQUEsc0JBQXNCLEdBQUcsMkNBQTJDLENBQUM7SUFDckUsUUFBQSxvQkFBb0IsR0FBRyx1Q0FBdUMsQ0FBQztJQUMvRCxRQUFBLGlCQUFpQixHQUFHLGdDQUFnQyxDQUFDO0lBQ3JELFFBQUEsb0JBQW9CLEdBQUcsc0NBQXNDLENBQUM7SUFFOUQsUUFBQSxzQkFBc0IsR0FBMkQ7UUFDN0YsUUFBUTtRQUNSLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtRQUMzRSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7UUFDbkYsRUFBRSxTQUFTLEVBQUUsOEJBQThCLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFO1FBQzVGLFVBQVU7UUFDVixFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO1FBQ25FLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTtRQUMxRSxPQUFPO1FBQ1AsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxzQkFBc0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFO1FBQzNFLEVBQUUsU0FBUyxFQUFFLHlCQUF5QixFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtRQUNuRixFQUFFLFNBQVMsRUFBRSwwQkFBMEIsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7UUFDakYsTUFBTTtRQUNOLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtRQUM1RSxFQUFFLFNBQVMsRUFBRSx5QkFBeUIsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7UUFDbkYsU0FBUztRQUNULEVBQUUsU0FBUyxFQUFFLG1CQUFtQixFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTtRQUMzRSxVQUFVO1FBQ1YsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtRQUM1RSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7UUFDaEYsUUFBUTtRQUNSLEVBQUUsU0FBUyxFQUFFLDBCQUEwQixFQUFFLFlBQVksRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFO1FBQzVGLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7UUFDckUsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtRQUN2RSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFO1FBQ3pFLGNBQWM7UUFDZCxFQUFFLFNBQVMsRUFBRSwwQkFBMEIsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUU7UUFDbEYsTUFBTTtRQUNOLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7UUFDN0QsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtRQUNuRSxZQUFZO1FBQ1osRUFBRSxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUU7UUFDeEYsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRTtRQUNoRSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFO0tBQ3RFLENBQUMifQ==