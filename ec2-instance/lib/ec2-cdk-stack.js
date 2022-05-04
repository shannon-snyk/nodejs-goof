"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ec2CdkStack = void 0;
const ec2 = require("aws-cdk-lib/aws-ec2");
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const path = require("path");
// import { KeyPair } from 'cdk-ec2-key-pair';
const aws_s3_assets_1 = require("aws-cdk-lib/aws-s3-assets");
class Ec2CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create a Key Pair to be used with this EC2 Instance
        // Temporarily disabled since `cdk-ec2-key-pair` is not yet CDK v2 compatible
        // const key = new KeyPair(this, 'KeyPair', {
        //   name: 'cdk-keypair',
        //   description: 'Key Pair created with CDK Deployment',
        // });
        // key.grantReadOnPublicKey
        // Create new VPC with 2 Subnets
        const vpc = new ec2.Vpc(this, 'VPC', {
            natGateways: 0,
            subnetConfiguration: [{
                    cidrMask: 24,
                    name: "asterisk",
                    subnetType: ec2.SubnetType.PUBLIC
                }]
        });
        // Allow SSH (TCP Port 22) access from anywhere
        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc,
            description: 'Allow SSH (TCP port 22) in',
            allowAllOutbound: true
        });
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH Access');
        const role = new iam.Role(this, 'ec2Role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
        });
        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
        // Use Latest Amazon Linux Image - CPU Type ARM64
        const ami = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            cpuType: ec2.AmazonLinuxCpuType.ARM_64
        });
        // Create the instance using the Security Group, AMI, and KeyPair defined in the VPC created
        const ec2Instance = new ec2.Instance(this, 'Instance', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
            machineImage: ami,
            securityGroup: securityGroup,
            // keyName: key.keyPairName,
            role: role
        });
        // Create an asset that will be used as part of User Data to run on first load
        const asset = new aws_s3_assets_1.Asset(this, 'Asset', { path: path.join(__dirname, '../src/config.sh') });
        const localPath = ec2Instance.userData.addS3DownloadCommand({
            bucket: asset.bucket,
            bucketKey: asset.s3ObjectKey,
        });
        ec2Instance.userData.addExecuteFileCommand({
            filePath: localPath,
            arguments: '--verbose -y'
        });
        asset.grantRead(ec2Instance.role);
        // Create outputs for connecting
        new cdk.CfnOutput(this, 'IP Address', { value: ec2Instance.instancePublicIp });
        // new cdk.CfnOutput(this, 'Key Name', { value: key.keyPairName })
        new cdk.CfnOutput(this, 'Download Key Command', { value: 'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem' });
        new cdk.CfnOutput(this, 'ssh command', { value: 'ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@' + ec2Instance.instancePublicIp });
    }
}
exports.Ec2CdkStack = Ec2CdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWMyLWNkay1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVjMi1jZGstc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTJDO0FBQzNDLG1DQUFtQztBQUNuQywyQ0FBMEM7QUFDMUMsNkJBQTZCO0FBQzdCLDhDQUE4QztBQUM5Qyw2REFBa0Q7QUFHbEQsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDeEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixzREFBc0Q7UUFDdEQsNkVBQTZFO1FBQzdFLDZDQUE2QztRQUM3Qyx5QkFBeUI7UUFDekIseURBQXlEO1FBQ3pELE1BQU07UUFDTiwyQkFBMkI7UUFFM0IsZ0NBQWdDO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ25DLFdBQVcsRUFBRSxDQUFDO1lBQ2QsbUJBQW1CLEVBQUUsQ0FBQztvQkFDcEIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07aUJBQ2xDLENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCwrQ0FBK0M7UUFDL0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDakUsR0FBRztZQUNILFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFDSCxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtRQUV0RixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUN6QyxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUM7U0FDekQsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFBO1FBRWpHLGlEQUFpRDtRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztZQUNuQyxVQUFVLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGNBQWM7WUFDcEQsT0FBTyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNO1NBQ3ZDLENBQUMsQ0FBQztRQUVILDRGQUE0RjtRQUM1RixNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNyRCxHQUFHO1lBQ0gsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQ2hGLFlBQVksRUFBRSxHQUFHO1lBQ2pCLGFBQWEsRUFBRSxhQUFhO1lBQzVCLDRCQUE0QjtZQUM1QixJQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztRQUVILDhFQUE4RTtRQUM5RSxNQUFNLEtBQUssR0FBRyxJQUFJLHFCQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRixNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDO1lBQzFELE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVc7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQztZQUN6QyxRQUFRLEVBQUUsU0FBUztZQUNuQixTQUFTLEVBQUUsY0FBYztTQUMxQixDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQyxnQ0FBZ0M7UUFDaEMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUMvRSxrRUFBa0U7UUFDbEUsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEtBQUssRUFBRSwySkFBMkosRUFBRSxDQUFDLENBQUE7UUFDdk4sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsRUFBRSxLQUFLLEVBQUUsb0RBQW9ELEdBQUcsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQTtJQUN4SSxDQUFDO0NBQ0Y7QUF2RUQsa0NBdUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZWMyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWMyXCI7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuLy8gaW1wb3J0IHsgS2V5UGFpciB9IGZyb20gJ2Nkay1lYzIta2V5LXBhaXInO1xuaW1wb3J0IHsgQXNzZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtYXNzZXRzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgY2xhc3MgRWMyQ2RrU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBLZXkgUGFpciB0byBiZSB1c2VkIHdpdGggdGhpcyBFQzIgSW5zdGFuY2VcbiAgICAvLyBUZW1wb3JhcmlseSBkaXNhYmxlZCBzaW5jZSBgY2RrLWVjMi1rZXktcGFpcmAgaXMgbm90IHlldCBDREsgdjIgY29tcGF0aWJsZVxuICAgIC8vIGNvbnN0IGtleSA9IG5ldyBLZXlQYWlyKHRoaXMsICdLZXlQYWlyJywge1xuICAgIC8vICAgbmFtZTogJ2Nkay1rZXlwYWlyJyxcbiAgICAvLyAgIGRlc2NyaXB0aW9uOiAnS2V5IFBhaXIgY3JlYXRlZCB3aXRoIENESyBEZXBsb3ltZW50JyxcbiAgICAvLyB9KTtcbiAgICAvLyBrZXkuZ3JhbnRSZWFkT25QdWJsaWNLZXlcblxuICAgIC8vIENyZWF0ZSBuZXcgVlBDIHdpdGggMiBTdWJuZXRzXG4gICAgY29uc3QgdnBjID0gbmV3IGVjMi5WcGModGhpcywgJ1ZQQycsIHtcbiAgICAgIG5hdEdhdGV3YXlzOiAwLFxuICAgICAgc3VibmV0Q29uZmlndXJhdGlvbjogW3tcbiAgICAgICAgY2lkck1hc2s6IDI0LFxuICAgICAgICBuYW1lOiBcImFzdGVyaXNrXCIsXG4gICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQ1xuICAgICAgfV1cbiAgICB9KTtcblxuICAgIC8vIEFsbG93IFNTSCAoVENQIFBvcnQgMjIpIGFjY2VzcyBmcm9tIGFueXdoZXJlXG4gICAgY29uc3Qgc2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnU2VjdXJpdHlHcm91cCcsIHtcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWxsb3cgU1NIIChUQ1AgcG9ydCAyMikgaW4nLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZVxuICAgIH0pO1xuICAgIHNlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoZWMyLlBlZXIuYW55SXB2NCgpLCBlYzIuUG9ydC50Y3AoMjIpLCAnQWxsb3cgU1NIIEFjY2VzcycpXG5cbiAgICBjb25zdCByb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdlYzJSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2VjMi5hbWF6b25hd3MuY29tJylcbiAgICB9KVxuXG4gICAgcm9sZS5hZGRNYW5hZ2VkUG9saWN5KGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQW1hem9uU1NNTWFuYWdlZEluc3RhbmNlQ29yZScpKVxuXG4gICAgLy8gVXNlIExhdGVzdCBBbWF6b24gTGludXggSW1hZ2UgLSBDUFUgVHlwZSBBUk02NFxuICAgIGNvbnN0IGFtaSA9IG5ldyBlYzIuQW1hem9uTGludXhJbWFnZSh7XG4gICAgICBnZW5lcmF0aW9uOiBlYzIuQW1hem9uTGludXhHZW5lcmF0aW9uLkFNQVpPTl9MSU5VWF8yLFxuICAgICAgY3B1VHlwZTogZWMyLkFtYXpvbkxpbnV4Q3B1VHlwZS5BUk1fNjRcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSB0aGUgaW5zdGFuY2UgdXNpbmcgdGhlIFNlY3VyaXR5IEdyb3VwLCBBTUksIGFuZCBLZXlQYWlyIGRlZmluZWQgaW4gdGhlIFZQQyBjcmVhdGVkXG4gICAgY29uc3QgZWMySW5zdGFuY2UgPSBuZXcgZWMyLkluc3RhbmNlKHRoaXMsICdJbnN0YW5jZScsIHtcbiAgICAgIHZwYyxcbiAgICAgIGluc3RhbmNlVHlwZTogZWMyLkluc3RhbmNlVHlwZS5vZihlYzIuSW5zdGFuY2VDbGFzcy5UNEcsIGVjMi5JbnN0YW5jZVNpemUuTUlDUk8pLFxuICAgICAgbWFjaGluZUltYWdlOiBhbWksXG4gICAgICBzZWN1cml0eUdyb3VwOiBzZWN1cml0eUdyb3VwLFxuICAgICAgLy8ga2V5TmFtZToga2V5LmtleVBhaXJOYW1lLFxuICAgICAgcm9sZTogcm9sZVxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGFzc2V0IHRoYXQgd2lsbCBiZSB1c2VkIGFzIHBhcnQgb2YgVXNlciBEYXRhIHRvIHJ1biBvbiBmaXJzdCBsb2FkXG4gICAgY29uc3QgYXNzZXQgPSBuZXcgQXNzZXQodGhpcywgJ0Fzc2V0JywgeyBwYXRoOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vc3JjL2NvbmZpZy5zaCcpIH0pO1xuICAgIGNvbnN0IGxvY2FsUGF0aCA9IGVjMkluc3RhbmNlLnVzZXJEYXRhLmFkZFMzRG93bmxvYWRDb21tYW5kKHtcbiAgICAgIGJ1Y2tldDogYXNzZXQuYnVja2V0LFxuICAgICAgYnVja2V0S2V5OiBhc3NldC5zM09iamVjdEtleSxcbiAgICB9KTtcblxuICAgIGVjMkluc3RhbmNlLnVzZXJEYXRhLmFkZEV4ZWN1dGVGaWxlQ29tbWFuZCh7XG4gICAgICBmaWxlUGF0aDogbG9jYWxQYXRoLFxuICAgICAgYXJndW1lbnRzOiAnLS12ZXJib3NlIC15J1xuICAgIH0pO1xuICAgIGFzc2V0LmdyYW50UmVhZChlYzJJbnN0YW5jZS5yb2xlKTtcblxuICAgIC8vIENyZWF0ZSBvdXRwdXRzIGZvciBjb25uZWN0aW5nXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0lQIEFkZHJlc3MnLCB7IHZhbHVlOiBlYzJJbnN0YW5jZS5pbnN0YW5jZVB1YmxpY0lwIH0pO1xuICAgIC8vIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdLZXkgTmFtZScsIHsgdmFsdWU6IGtleS5rZXlQYWlyTmFtZSB9KVxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEb3dubG9hZCBLZXkgQ29tbWFuZCcsIHsgdmFsdWU6ICdhd3Mgc2VjcmV0c21hbmFnZXIgZ2V0LXNlY3JldC12YWx1ZSAtLXNlY3JldC1pZCBlYzItc3NoLWtleS9jZGsta2V5cGFpci9wcml2YXRlIC0tcXVlcnkgU2VjcmV0U3RyaW5nIC0tb3V0cHV0IHRleHQgPiBjZGsta2V5LnBlbSAmJiBjaG1vZCA0MDAgY2RrLWtleS5wZW0nIH0pXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ3NzaCBjb21tYW5kJywgeyB2YWx1ZTogJ3NzaCAtaSBjZGsta2V5LnBlbSAtbyBJZGVudGl0aWVzT25seT15ZXMgZWMyLXVzZXJAJyArIGVjMkluc3RhbmNlLmluc3RhbmNlUHVibGljSXAgfSlcbiAgfVxufVxuIl19